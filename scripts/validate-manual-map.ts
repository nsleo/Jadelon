import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

const repoRoot = process.cwd();
const originalPath = path.join(
  repoRoot,
  "assets/derived/cartography/manual-retouch/v0.1/mapa-original-lossless.png",
);
const allowedMaskPath = path.join(
  repoRoot,
  "assets/derived/cartography/manual-retouch/v0.1/allowed-edit-mask.png",
);
const reviewRoot = path.join(repoRoot, "artifacts/review");

function ensureArgument() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    throw new Error("Usage: npm run validate:manual-map -- <caminho-do-png>");
  }

  return path.resolve(inputPath);
}

async function loadRgba(filePath: string) {
  const image = sharp(filePath).ensureAlpha();
  const metadata = await image.metadata();
  const raw = await image.raw().toBuffer({ resolveWithObject: true });

  return {
    metadata,
    data: new Uint8Array(raw.data.buffer, raw.data.byteOffset, raw.data.byteLength),
    width: raw.info.width,
    height: raw.info.height,
  };
}

async function writeRawPng(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  targetPath: string,
) {
  await sharp(Buffer.from(pixels), {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toFile(targetPath);
}

async function main() {
  const candidatePath = ensureArgument();

  if (!candidatePath.toLowerCase().endsWith(".png")) {
    throw new Error("The returned file must be a PNG.");
  }

  await fs.promises.mkdir(reviewRoot, { recursive: true });

  const original = await loadRgba(originalPath);
  const candidate = await loadRgba(candidatePath);
  const allowedMask = await loadRgba(allowedMaskPath);

  if (
    candidate.width !== original.width ||
    candidate.height !== original.height
  ) {
    throw new Error("Returned PNG dimensions must match the original 2048x1536.");
  }

  if (candidate.metadata.format !== "png") {
    throw new Error("Returned file must decode as PNG.");
  }

  const diffPreview = new Uint8ClampedArray(original.width * original.height * 4);
  const outsideMaskPreview = new Uint8ClampedArray(original.width * original.height * 4);
  let changedPixels = 0;
  let changedOutsideMask = 0;
  let maxOutsideDifference = 0;

  for (let index = 0; index < original.width * original.height; index += 1) {
    const offset = index * 4;
    const difference =
      Math.abs(original.data[offset] - candidate.data[offset]) +
      Math.abs(original.data[offset + 1] - candidate.data[offset + 1]) +
      Math.abs(original.data[offset + 2] - candidate.data[offset + 2]);
    const alpha = allowedMask.data[offset];
    const changed = difference > 8;
    const changedOutside = changed && alpha < 8;

    if (changed) {
      changedPixels += 1;
    }

    if (changedOutside) {
      changedOutsideMask += 1;
      maxOutsideDifference = Math.max(maxOutsideDifference, difference);
    }

    diffPreview[offset] = changed ? 255 : original.data[offset];
    diffPreview[offset + 1] = changed ? 176 : original.data[offset + 1];
    diffPreview[offset + 2] = changed ? 56 : original.data[offset + 2];
    diffPreview[offset + 3] = 255;

    outsideMaskPreview[offset] = changedOutside ? 255 : original.data[offset];
    outsideMaskPreview[offset + 1] = changedOutside ? 64 : original.data[offset + 1];
    outsideMaskPreview[offset + 2] = changedOutside ? 64 : original.data[offset + 2];
    outsideMaskPreview[offset + 3] = 255;
  }

  await writeRawPng(
    diffPreview,
    original.width,
    original.height,
    path.join(reviewRoot, "manual-retouch-diff.png"),
  );
  await writeRawPng(
    outsideMaskPreview,
    original.width,
    original.height,
    path.join(reviewRoot, "manual-retouch-outside-mask.png"),
  );

  const report = {
    candidatePath,
    originalPath,
    allowedMaskPath,
    width: candidate.width,
    height: candidate.height,
    format: candidate.metadata.format,
    colorSpace: candidate.metadata.space,
    changedPixels,
    changedOutsideMask,
    maxOutsideDifference,
    accepted: changedOutsideMask === 0,
    note:
      "Aprovacao visual automatica nao e fornecida. O relatorio valida apenas integridade tecnica e mudancas fora da mascara.",
  };

  await fs.promises.writeFile(
    path.join(reviewRoot, "manual-retouch-validation.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  if (changedOutsideMask > 0) {
    throw new Error(
      `Returned PNG changes ${changedOutsideMask} pixels outside the allowed edit mask.`,
    );
  }

  console.log(JSON.stringify(report, null, 2));
}

await main();
