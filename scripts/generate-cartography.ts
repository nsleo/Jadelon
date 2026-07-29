import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import {
  cartographyCandidateAssets,
  supersededCartographyAssetIds,
} from "../src/lib/cartography/candidate-assets.ts";
import {
  candidateContinentShapes,
  getShapePolygonSets,
} from "../src/lib/cartography/continent-shapes.ts";

const repoRoot = process.cwd();
const originalPath = path.join(repoRoot, "assets/reference/mapa-mundi-original.jpg");
const cleanSourcePath = path.join(
  repoRoot,
  "assets/reference/mapa-mundi-original-sem-labels.png",
);
const candidateDir = path.join(repoRoot, "assets/derived/cartography/candidates");
const publicCandidateDir = path.join(repoRoot, "public/assets/jadelon/maps/candidates");
const reviewDir = path.join(repoRoot, "artifacts/review");
const reportPath = path.join(reviewDir, "cartography-generation-report.json");

const baseWidth = 2048;
const baseHeight = 1536;
const textureWidth = 4096;
const textureHeight = 2048;

const projectionProfiles = [
  { id: "p55", latitudeBand: 55, heightRatio: 110 / 180, oceanWeight: 0.92 },
  { id: "p60", latitudeBand: 60, heightRatio: 120 / 180, oceanWeight: 1 },
  { id: "p65", latitudeBand: 65, heightRatio: 130 / 180, oceanWeight: 1.08 },
] as const;

const labelRegions = [
  { id: "snoklem", x: 366, y: 360, width: 356, height: 112 },
  { id: "baaldrum", x: 458, y: 804, width: 394, height: 122 },
  { id: "bergskrona", x: 392, y: 1280, width: 470, height: 120 },
  { id: "cathizar", x: 1480, y: 190, width: 432, height: 112 },
  { id: "neverith", x: 1406, y: 734, width: 408, height: 114 },
  { id: "xharas-tor", x: 1570, y: 1320, width: 430, height: 120 },
] as const;

const oceanSampleRegions = [
  { left: 0, top: 0, width: 240, height: 240 },
  { left: 0, top: 612, width: 220, height: 220 },
  { left: 880, top: 880, width: 240, height: 240 },
  { left: 1740, top: 860, width: 220, height: 220 },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getIndex(x: number, y: number, width: number) {
  return (y * width + x) * 4;
}

function md5(buffer: Buffer | Uint8Array) {
  return crypto.createHash("md5").update(buffer).digest("hex");
}

function polygonToSvgPoints(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function toBufferView(view: ArrayBufferView) {
  return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
}

function sampleRgb(data: Uint8ClampedArray, x: number, y: number, width: number) {
  const index = getIndex(x, y, width);

  return [
    data[index] ?? 0,
    data[index + 1] ?? 0,
    data[index + 2] ?? 0,
  ] as const;
}

function computeMeanRgb(
  data: Uint8ClampedArray,
  width: number,
  region: { left: number; top: number; width: number; height: number },
) {
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (let y = region.top; y < region.top + region.height; y += 1) {
    for (let x = region.left; x < region.left + region.width; x += 1) {
      const [r, g, b] = sampleRgb(data, x, y, width);
      totalR += r;
      totalG += g;
      totalB += b;
      count += 1;
    }
  }

  return {
    r: totalR / count,
    g: totalG / count,
    b: totalB / count,
  };
}

function colorDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function dilate(mask: Uint8Array, width: number, height: number, radius: number) {
  let current = new Uint8Array(mask);

  for (let iteration = 0; iteration < radius; iteration += 1) {
    const next = new Uint8Array(current);

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x;

        if (current[index]) {
          continue;
        }

        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            if (current[(y + offsetY) * width + x + offsetX]) {
              next[index] = 1;
              offsetY = 2;
              break;
            }
          }
        }
      }
    }

    current = next;
  }

  return current;
}

function erode(mask: Uint8Array, width: number, height: number, radius: number) {
  let current = new Uint8Array(mask);

  for (let iteration = 0; iteration < radius; iteration += 1) {
    const next = new Uint8Array(current);

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x;

        if (!current[index]) {
          continue;
        }

        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            if (!current[(y + offsetY) * width + x + offsetX]) {
              next[index] = 0;
              offsetY = 2;
              break;
            }
          }
        }
      }
    }

    current = next;
  }

  return current;
}

function smoothMask(mask: Uint8Array, width: number, height: number) {
  return erode(dilate(mask, width, height, 4), width, height, 2);
}

function buildMaskSvg(shapeId: string) {
  const shape = candidateContinentShapes.find((entry) => entry.id === shapeId);

  if (!shape) {
    throw new Error(`Unknown shape "${shapeId}".`);
  }

  const polygons = getShapePolygonSets(shape)
    .map(
      (polygon) =>
        `<polygon fill="#ffffff" points="${polygonToSvgPoints(polygon)}" />`,
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
      <rect width="${baseWidth}" height="${baseHeight}" fill="transparent" />
      ${polygons}
    </svg>
  `;
}

function buildOverlayPayload() {
  return candidateContinentShapes.map((shape) => ({
    ...shape,
    polygon: shape.polygon ?? [],
    islandPolygons: shape.islandPolygons ?? [],
    status: "candidate",
    sourceAssetId: "mapa-atlas-clean-source-candidate",
  }));
}

async function ensureDirectories() {
  await Promise.all(
    [
      candidateDir,
      path.join(candidateDir, "masks"),
      publicCandidateDir,
      path.join(publicCandidateDir, "masks"),
      reviewDir,
    ].map((directory) => fs.mkdir(directory, { recursive: true })),
  );
}

async function writePngAndWebp(
  pngPath: string,
  publicWebpPath: string,
  image: sharp.Sharp | Buffer,
  webpQuality = 86,
) {
  const source = Buffer.isBuffer(image) ? sharp(image) : image;
  const pngBuffer = await source.png().toBuffer();

  await fs.writeFile(pngPath, pngBuffer);
  await sharp(pngBuffer).webp({ quality: webpQuality }).toFile(publicWebpPath);

  return pngBuffer;
}

async function loadImageRaw(imagePath: string) {
  return sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

async function validateSourceMaps() {
  const original = await sharp(originalPath).metadata();
  const clean = await sharp(cleanSourcePath).metadata();

  if (clean.format !== "png") {
    throw new Error("Clean source map must be stored as PNG.");
  }

  if (original.width !== baseWidth || original.height !== baseHeight) {
    throw new Error("Original reference map dimensions are unexpected.");
  }

  if (clean.width !== baseWidth || clean.height !== baseHeight) {
    throw new Error("Clean source map dimensions must stay 2048x1536.");
  }

  const [originalRaw, cleanRaw] = await Promise.all([
    loadImageRaw(originalPath),
    loadImageRaw(cleanSourcePath),
  ]);
  const originalData = new Uint8ClampedArray(originalRaw.data.buffer);
  const cleanData = new Uint8ClampedArray(cleanRaw.data.buffer);

  let outsideDifferencePixels = 0;
  let totalOutsidePixels = 0;
  const labelChecks = labelRegions.map((region) => {
    let differenceSum = 0;
    let changedPixels = 0;

    for (let y = region.y; y < region.y + region.height; y += 1) {
      for (let x = region.x; x < region.x + region.width; x += 1) {
        const originalPixel = sampleRgb(originalData, x, y, baseWidth);
        const cleanPixel = sampleRgb(cleanData, x, y, baseWidth);
        const difference =
          Math.abs(originalPixel[0] - cleanPixel[0]) +
          Math.abs(originalPixel[1] - cleanPixel[1]) +
          Math.abs(originalPixel[2] - cleanPixel[2]);

        differenceSum += difference;
        if (difference > 18) {
          changedPixels += 1;
        }
      }
    }

    return {
      id: region.id,
      meanDifference: differenceSum / (region.width * region.height),
      changedRatio: changedPixels / (region.width * region.height),
      passed:
        differenceSum / (region.width * region.height) > 3 ||
        changedPixels / (region.width * region.height) > 0.01,
    };
  });

  const labelMask = new Uint8Array(baseWidth * baseHeight);

  for (const region of labelRegions) {
    for (let y = region.y; y < region.y + region.height; y += 1) {
      for (let x = region.x; x < region.x + region.width; x += 1) {
        labelMask[y * baseWidth + x] = 1;
      }
    }
  }

  for (let y = 0; y < baseHeight; y += 1) {
    for (let x = 0; x < baseWidth; x += 1) {
      const index = y * baseWidth + x;
      if (labelMask[index]) {
        continue;
      }

      const originalPixel = sampleRgb(originalData, x, y, baseWidth);
      const cleanPixel = sampleRgb(cleanData, x, y, baseWidth);
      const difference =
        Math.abs(originalPixel[0] - cleanPixel[0]) +
        Math.abs(originalPixel[1] - cleanPixel[1]) +
        Math.abs(originalPixel[2] - cleanPixel[2]);

      if (difference > 22) {
        outsideDifferencePixels += 1;
      }
      totalOutsidePixels += 1;
    }
  }

  const originalBuffer = await sharp(originalPath).png().toBuffer();
  const cleanBuffer = await sharp(cleanSourcePath).png().toBuffer();
  const diffOverlay = await sharp(originalPath)
    .composite([
      {
        input: await sharp(cleanSourcePath)
          .tint({ r: 200, g: 240, b: 255 })
          .modulate({ brightness: 1.04 })
          .png()
          .toBuffer(),
        blend: "difference",
      },
    ])
    .png()
    .toBuffer();

  const comparisonLabelSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="6144" height="1626" viewBox="0 0 6144 1626">
      <rect width="6144" height="90" fill="#091116" />
      <text x="1024" y="58" font-size="38" text-anchor="middle" fill="#f3ead5" font-family="Georgia">Original com labels</text>
      <text x="3072" y="58" font-size="38" text-anchor="middle" fill="#f3ead5" font-family="Georgia">Export limpo master</text>
      <text x="5120" y="58" font-size="38" text-anchor="middle" fill="#f3ead5" font-family="Georgia">Diferenca visual</text>
    </svg>
  `;

  await sharp({
    create: {
      width: 6144,
      height: 1626,
      channels: 4,
      background: { r: 9, g: 17, b: 22, alpha: 1 },
    },
  })
    .composite([
      { input: Buffer.from(comparisonLabelSvg), left: 0, top: 0 },
      { input: originalBuffer, left: 0, top: 90 },
      { input: cleanBuffer, left: 2048, top: 90 },
      { input: diffOverlay, left: 4096, top: 90 },
    ])
    .png()
    .toFile(path.join(reviewDir, "clean-export-vs-original.png"));

  return {
    clean: {
      checksum: md5(await fs.readFile(cleanSourcePath)),
      dimensions: `${clean.width} x ${clean.height}`,
      format: clean.format,
      origin: "assets/reference/mapa-mundi-original-sem-labels.png",
    },
    original: {
      checksum: md5(await fs.readFile(originalPath)),
      dimensions: `${original.width} x ${original.height}`,
      format: original.format,
      origin: "assets/reference/mapa-mundi-original.jpg",
    },
    labelChecks,
    outsideDifferenceRatio: outsideDifferencePixels / totalOutsidePixels,
  };
}

async function buildOceanBase(sourcePath: string) {
  const resizedLayers = await Promise.all(
    oceanSampleRegions.map(async (region, index) => {
      const blur = 24 + index * 6;
      return sharp(sourcePath)
        .extract(region)
        .resize(textureWidth, textureHeight, { fit: "cover" })
        .blur(blur)
        .modulate({
          brightness: 0.9 + index * 0.03,
          saturation: 0.82,
        })
        .ensureAlpha([0.5, 0.26, 0.24, 0.16][index] ?? 0.2)
        .png()
        .toBuffer();
    }),
  );

  const overlay = await sharp(sourcePath)
    .resize(textureWidth, textureHeight, { fit: "cover" })
    .blur(48)
    .modulate({ brightness: 0.68, saturation: 0.6 })
    .ensureAlpha(0.22)
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: textureWidth,
      height: textureHeight,
      channels: 4,
      background: { r: 100, g: 128, b: 134, alpha: 1 },
    },
  }).composite([
    { input: resizedLayers[0], blend: "overlay" },
    { input: resizedLayers[1], blend: "screen" },
    { input: resizedLayers[2], blend: "soft-light" },
    { input: resizedLayers[3], blend: "multiply" },
    { input: overlay, blend: "over" },
  ]);
}

async function equalizeHorizontalSeam(input: Buffer) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
  const seamWidth = 24;

  for (let y = 0; y < info.height; y += 1) {
    for (let offset = 0; offset < seamWidth; offset += 1) {
      const leftIndex = getIndex(offset, y, info.width);
      const rightIndex = getIndex(info.width - seamWidth + offset, y, info.width);
      const weight = (offset + 1) / (seamWidth + 1);

      for (let channel = 0; channel < 4; channel += 1) {
        const leftValue = pixels[leftIndex + channel] ?? 0;
        const rightValue = pixels[rightIndex + channel] ?? 0;
        const blended = Math.round(leftValue * (1 - weight) + rightValue * weight);
        pixels[leftIndex + channel] = blended;
        pixels[rightIndex + channel] = blended;
      }
    }
  }

  return sharp(toBufferView(pixels), {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  }).png().toBuffer();
}

async function buildProjectedLandMask(
  landMask: Uint8Array,
  width: number,
  height: number,
) {
  return sharp(Buffer.from(landMask), {
    raw: {
      width: baseWidth,
      height: baseHeight,
      channels: 1,
    },
  })
    .resize(width, height, {
      fit: "fill",
      kernel: "nearest",
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
}

async function applyWaterEdgeBlend(
  sourcePath: string,
  landMask: Uint8Array,
  width: number,
  height: number,
) {
  const projectedMapRaw = await sharp(sourcePath)
    .resize(width, height, {
      fit: "fill",
      kernel: "lanczos3",
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const projectedLandMask = await buildProjectedLandMask(landMask, width, height);
  const pixels = new Uint8ClampedArray(
    projectedMapRaw.data.buffer,
    projectedMapRaw.data.byteOffset,
    projectedMapRaw.data.byteLength,
  );
  const blendMask = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = y * width + x;
      const rgbaIndex = pixelIndex * 4;
      const landValue = projectedLandMask.data[pixelIndex] ?? 0;
      const edgeDistance = Math.min(x, y, width - 1 - x, height - 1 - y);
      const softEdge = clamp(edgeDistance / 120, 0, 1);
      const hardEdge = clamp(edgeDistance / 42, 0, 1);
      const edgeBlend = clamp(softEdge * 0.7 + hardEdge * 0.3, 0, 1);

      if (landValue < 24) {
        const alphaFactor = 0.08 + edgeBlend * 0.92;
        pixels[rgbaIndex + 3] = Math.round((pixels[rgbaIndex + 3] ?? 255) * alphaFactor);
        blendMask[pixelIndex] = Math.round((1 - alphaFactor) * 255);
        continue;
      }

      pixels[rgbaIndex + 3] = 255;
    }
  }

  return {
    blendMask,
    buffer: await sharp(toBufferView(pixels), {
      raw: {
        width,
        height,
        channels: 4,
      },
    })
      .png()
      .toBuffer(),
  };
}

async function buildProjectionCandidate(
  sourcePath: string,
  landMask: Uint8Array,
  profile: (typeof projectionProfiles)[number],
) {
  const mapHeight = Math.round(textureHeight * profile.heightRatio);
  const mapWidth = Math.round((baseWidth / baseHeight) * mapHeight);
  const left = Math.round((textureWidth - mapWidth) / 2);
  const top = Math.round((textureHeight - mapHeight) / 2);

  const background = await buildOceanBase(sourcePath);
  const { blendMask, buffer: projectedMap } = await applyWaterEdgeBlend(
    sourcePath,
    landMask,
    mapWidth,
    mapHeight,
  );

  const vignetteSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${textureWidth}" height="${textureHeight}" viewBox="0 0 ${textureWidth} ${textureHeight}">
      <defs>
        <linearGradient id="top-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(15,28,32,0.46)" />
          <stop offset="18%" stop-color="rgba(15,28,32,0.10)" />
          <stop offset="82%" stop-color="rgba(15,28,32,0.10)" />
          <stop offset="100%" stop-color="rgba(15,28,32,0.46)" />
        </linearGradient>
      </defs>
      <rect width="${textureWidth}" height="${textureHeight}" fill="url(#top-bottom)" />
    </svg>
  `;

  const compositeBuffer = await background
    .composite([
      { input: projectedMap, left, top },
      {
        input: await sharp(Buffer.from(vignetteSvg))
          .ensureAlpha(clamp(profile.oceanWeight - 0.1, 0.75, 1))
          .png()
          .toBuffer(),
        blend: "multiply",
      },
    ])
    .png()
    .toBuffer();

  const seamSafeBuffer = await equalizeHorizontalSeam(compositeBuffer);
  const stats = await sharp(seamSafeBuffer).stats();
  const seamPreview = await sharp({
    create: {
      width: 960,
      height: 640,
      channels: 4,
      background: { r: 10, g: 18, b: 22, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(seamSafeBuffer)
          .extract({ left: 0, top: 0, width: 128, height: textureHeight })
          .resize(440, 560)
          .png()
          .toBuffer(),
        left: 24,
        top: 40,
      },
      {
        input: await sharp(seamSafeBuffer)
          .extract({ left: textureWidth - 128, top: 0, width: 128, height: textureHeight })
          .resize(440, 560)
          .png()
          .toBuffer(),
        left: 496,
        top: 40,
      },
    ])
    .png()
    .toBuffer();

  await fs.writeFile(
    path.join(reviewDir, `projection-${profile.id}-seam-preview.png`),
    seamPreview,
  );

  const blendDetail = await sharp({
    create: {
      width: 1440,
      height: 720,
      channels: 4,
      background: { r: 9, g: 17, b: 22, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(seamSafeBuffer)
          .extract({ left: left - 96, top: top - 64, width: 384, height: 256 })
          .resize(440, 300)
          .png()
          .toBuffer(),
        left: 24,
        top: 40,
      },
      {
        input: await sharp(seamSafeBuffer)
          .extract({
            left: left + mapWidth - 288,
            top: top + Math.round(mapHeight * 0.4),
            width: 384,
            height: 256,
          })
          .resize(440, 300)
          .png()
          .toBuffer(),
        left: 500,
        top: 40,
      },
      {
        input: await sharp(Buffer.from(blendMask), {
          raw: {
            width: mapWidth,
            height: mapHeight,
            channels: 1,
          },
        })
          .resize(440, 300, { fit: "contain" })
          .png()
          .toBuffer(),
        left: 976,
        top: 40,
      },
    ])
    .png()
    .toBuffer();

  return {
    blendDetail,
    buffer: seamSafeBuffer,
    report: {
      assetId: `mapa-globo-projection-${profile.id}`,
      latitudeBand: profile.latitudeBand,
      textureWidth,
      textureHeight,
      projectedMapWidth: mapWidth,
      projectedMapHeight: mapHeight,
      topPadding: top,
      bottomPadding: textureHeight - (top + mapHeight),
      leftPadding: left,
      rightPadding: textureWidth - (left + mapWidth),
      scaleApplied: Number((mapHeight / baseHeight).toFixed(4)),
      seamDelta: Number(
        (stats.channels[0]?.mean ?? 0) +
          (stats.channels[1]?.mean ?? 0) +
          (stats.channels[2]?.mean ?? 0),
      ),
    },
  };
}

async function buildLandMask(sourcePath: string) {
  const cleanRaw = await loadImageRaw(sourcePath);
  const cleanData = new Uint8ClampedArray(
    cleanRaw.data.buffer,
    cleanRaw.data.byteOffset,
    cleanRaw.data.byteLength,
  );
  const oceanReference = oceanSampleRegions
    .map((region) => computeMeanRgb(cleanData, baseWidth, region))
    .reduce(
      (aggregate, current) => ({
        r: aggregate.r + current.r / oceanSampleRegions.length,
        g: aggregate.g + current.g / oceanSampleRegions.length,
        b: aggregate.b + current.b / oceanSampleRegions.length,
      }),
      { r: 0, g: 0, b: 0 },
    );
  const mask = new Uint8Array(baseWidth * baseHeight);

  for (let y = 0; y < baseHeight; y += 1) {
    for (let x = 0; x < baseWidth; x += 1) {
      const [r, g, b] = sampleRgb(cleanData, x, y, baseWidth);
      const distance = colorDistance({ r, g, b }, oceanReference);
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);

      if (distance > 32 || brightness > 168 || saturation > 14) {
        mask[y * baseWidth + x] = 1;
      }
    }
  }

  return smoothMask(mask, baseWidth, baseHeight);
}

async function generateMasksAndOverlay(sourcePath: string) {
  const landMask = await buildLandMask(sourcePath);
  const maskReports = [];

  for (const shape of candidateContinentShapes) {
    const polygonMaskRaw = await sharp(Buffer.from(buildMaskSvg(shape.id)))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const polygonData = new Uint8ClampedArray(
      polygonMaskRaw.data.buffer,
      polygonMaskRaw.data.byteOffset,
      polygonMaskRaw.data.byteLength,
    );
    const alpha = new Uint8ClampedArray(baseWidth * baseHeight * 4);
    let activePixels = 0;

    for (let y = 0; y < baseHeight; y += 1) {
      for (let x = 0; x < baseWidth; x += 1) {
        const pixelIndex = y * baseWidth + x;
        const rgbaIndex = pixelIndex * 4;
        const polygonAlpha = polygonData[rgbaIndex + 3] ?? 0;

        if (!polygonAlpha || !landMask[pixelIndex]) {
          continue;
        }

        alpha[rgbaIndex] = 255;
        alpha[rgbaIndex + 1] = 255;
        alpha[rgbaIndex + 2] = 255;
        alpha[rgbaIndex + 3] = 255;
        activePixels += 1;
      }
    }

    const rasterMaskBuffer = await sharp(toBufferView(alpha), {
      raw: {
        width: baseWidth,
        height: baseHeight,
        channels: 4,
      },
    })
      .blur(0.6)
      .png()
      .toBuffer();

    const pngPath = path.join(candidateDir, "masks", `${shape.slug}-mask.png`);
    const publicWebpPath = path.join(publicCandidateDir, "masks", `${shape.slug}-mask.webp`);

    await writePngAndWebp(pngPath, publicWebpPath, rasterMaskBuffer, 84);
    maskReports.push({
      id: `${shape.slug}-mask`,
      sourceAssetId: "mapa-atlas-clean-source-candidate",
      coverage: Number((activePixels / (baseWidth * baseHeight)).toFixed(4)),
    });
  }

  await fs.writeFile(
    path.join(candidateDir, "overlay-semantic-clean-source-candidate.json"),
    `${JSON.stringify(buildOverlayPayload(), null, 2)}\n`,
    "utf8",
  );

  const maskComposite = await sharp(sourcePath)
    .ensureAlpha()
    .composite(
      candidateContinentShapes.map((shape, index) => ({
        input: Buffer.from(buildMaskSvg(shape.id)),
        blend: "screen",
        opacity: 0.22 + index * 0.02,
      })),
    )
    .png()
    .toBuffer();

  await fs.writeFile(path.join(reviewDir, "new-continent-masks.png"), maskComposite);

  return maskReports;
}

async function generateReviewComposites(
  candidates: Array<{
    blendDetail: Buffer;
    report: {
      assetId: string;
    };
  }>,
) {
  const sideBySideLayers = await Promise.all(
    projectionProfiles.map(async (profile) =>
      sharp(path.join(candidateDir, `mapa-globo-projection-${profile.id}.png`))
        .resize(1200, 600, { fit: "contain" })
        .png()
        .toBuffer(),
    ),
  );

  await sharp({
    create: {
      width: 3600,
      height: 688,
      channels: 4,
      background: { r: 10, g: 18, b: 22, alpha: 1 },
    },
  })
    .composite(
      sideBySideLayers.map((input, index) => ({
        input,
        left: index * 1200,
        top: 88,
      })),
    )
    .png()
    .toFile(path.join(reviewDir, "globe-projection-side-by-side.png"));

  const seamPanels = await Promise.all(
    projectionProfiles.map((profile) =>
      sharp(path.join(reviewDir, `projection-${profile.id}-seam-preview.png`))
        .png()
        .toBuffer(),
    ),
  );

  await sharp({
    create: {
      width: 2880,
      height: 640,
      channels: 4,
      background: { r: 10, g: 18, b: 22, alpha: 1 },
    },
  })
    .composite(
      seamPanels.map((input, index) => ({
        input,
        left: index * 960,
        top: 0,
      })),
    )
    .png()
    .toFile(path.join(reviewDir, "globe-projection-seams.png"));

  const backsideLayers = await Promise.all(
    projectionProfiles.map(async (profile) =>
      sharp(path.join(candidateDir, `mapa-globo-projection-${profile.id}.png`))
        .extract({ left: 1365, top: 256, width: 1366, height: 1536 })
        .resize(960, 540)
        .png()
        .toBuffer(),
    ),
  );

  await sharp({
    create: {
      width: 2880,
      height: 620,
      channels: 4,
      background: { r: 10, g: 18, b: 22, alpha: 1 },
    },
  })
    .composite(
      backsideLayers.map((input, index) => ({
        input,
        left: index * 960,
        top: 40,
      })),
    )
    .png()
    .toFile(path.join(reviewDir, "globe-projection-backside.png"));

  const p60Detail = candidates.find((candidate) => candidate.report.assetId === "mapa-globo-projection-p60");

  if (p60Detail) {
    await fs.writeFile(
      path.join(reviewDir, "projection-ocean-blend-detail.png"),
      p60Detail.blendDetail,
    );
  }

  return candidates;
}

async function generateCandidates(sourcePath: string) {
  const landMask = await buildLandMask(sourcePath);
  const atlasBuffer = await writePngAndWebp(
    path.join(candidateDir, "mapa-atlas-clean-source-candidate.png"),
    path.join(publicCandidateDir, "mapa-atlas-clean-source-candidate.webp"),
    sharp(sourcePath).ensureAlpha(),
    88,
  );

  const candidates = await Promise.all(
    projectionProfiles.map(async (profile) => {
      const result = await buildProjectionCandidate(sourcePath, landMask, profile);

      await writePngAndWebp(
        path.join(candidateDir, `mapa-globo-projection-${profile.id}.png`),
        path.join(publicCandidateDir, `mapa-globo-projection-${profile.id}.webp`),
        result.buffer,
        84,
      );

      return result;
    }),
  );

  await fs.writeFile(path.join(reviewDir, "atlas-clean-source.png"), atlasBuffer);

  return candidates;
}

async function main() {
  const start = Date.now();
  await ensureDirectories();

  const sourceValidation = await validateSourceMaps();
  const candidateResults = await generateCandidates(cleanSourcePath);
  const maskReports = await generateMasksAndOverlay(cleanSourcePath);
  await generateReviewComposites(candidateResults);

  const report = {
    generatedAssets: cartographyCandidateAssets.map((asset) => asset.id),
    sourceValidation,
    supersededAssetIds: [...supersededCartographyAssetIds],
    projectionProfiles: candidateResults.map((candidate) => candidate.report),
    maskReports,
    recommendation: "p60",
    elapsedSeconds: Number(((Date.now() - start) / 1000).toFixed(2)),
  };

  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

await main();
