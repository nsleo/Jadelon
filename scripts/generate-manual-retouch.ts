import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import sharp from "sharp";

import {
  manualRetouchCanvas,
  manualRetouchRegions,
  type LabelRetouchRegion,
} from "../src/lib/cartography/manual-retouch-config.ts";

const execFileAsync = promisify(execFile);

const repoRoot = process.cwd();
const originalJpgPath = path.join(repoRoot, "assets/reference/mapa-mundi-original.jpg");
const manualRoot = path.join(
  repoRoot,
  "assets/derived/cartography/manual-retouch/v0.1",
);
const labelsRoot = path.join(manualRoot, "labels");
const reviewRoot = path.join(repoRoot, "artifacts/review");
const zipPath = path.join(repoRoot, "JADELON_RETOQUE_MANUAL_MAPA_v0.1.zip");
const readmePath = path.join(repoRoot, "README_RETOQUE_MANUAL_MAPA_v0.1.md");

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function dilate(mask: Uint8Array, width: number, height: number, radius: number) {
  let current = new Uint8Array(mask);

  for (let step = 0; step < radius; step += 1) {
    const next = new Uint8Array(current);

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x;

        if (current[index]) {
          continue;
        }

        const neighbors = [
          index - 1,
          index + 1,
          index - width,
          index + width,
          index - width - 1,
          index - width + 1,
          index + width - 1,
          index + width + 1,
        ];

        if (neighbors.some((neighbor) => current[neighbor])) {
          next[index] = 1;
        }
      }
    }

    current = next;
  }

  return current;
}

function erode(mask: Uint8Array, width: number, height: number, radius: number) {
  let current = new Uint8Array(mask);

  for (let step = 0; step < radius; step += 1) {
    const next = new Uint8Array(current);

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x;

        if (!current[index]) {
          continue;
        }

        const neighbors = [
          index - 1,
          index + 1,
          index - width,
          index + width,
        ];

        if (neighbors.some((neighbor) => !current[neighbor])) {
          next[index] = 0;
        }
      }
    }

    current = next;
  }

  return current;
}

function getVectorMaskStyle(region: LabelRetouchRegion) {
  const styles: Record<string, { fontSize: number; letterSpacing: number }> = {
    snoklem: { fontSize: 62, letterSpacing: 1.5 },
    baaldrum: { fontSize: 64, letterSpacing: 1.2 },
    bergskrona: { fontSize: 60, letterSpacing: 1.1 },
    cathizar: { fontSize: 60, letterSpacing: 1.6 },
    neverith: { fontSize: 60, letterSpacing: 1.4 },
    "xharas-tor": { fontSize: 64, letterSpacing: 1.2 },
  };

  return styles[region.id] ?? { fontSize: 60, letterSpacing: 1.2 };
}

async function buildVectorLabelMask(region: LabelRetouchRegion) {
  const style = getVectorMaskStyle(region);
  const baselineY = Math.round(region.height * 0.66);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${region.width}" height="${region.height}" viewBox="0 0 ${region.width} ${region.height}">
      <rect width="${region.width}" height="${region.height}" fill="black" />
      <text x="50%" y="${baselineY + 4}" text-anchor="middle" fill="white" font-size="${style.fontSize}" font-family="Georgia" letter-spacing="${style.letterSpacing}px">${region.displayName}</text>
      <text x="50%" y="${baselineY}" text-anchor="middle" fill="white" stroke="white" stroke-width="8" paint-order="stroke" font-size="${style.fontSize}" font-family="Georgia" letter-spacing="${style.letterSpacing}px">${region.displayName}</text>
    </svg>
  `;
  const raw = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .threshold(1)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const mask = new Uint8Array(region.width * region.height);

  for (let index = 0; index < mask.length; index += 1) {
    mask[index] = raw.data[index * 4] > 0 ? 1 : 0;
  }

  return mask;
}

async function buildRegionMask(region: LabelRetouchRegion) {
  const vectorMask = await buildVectorLabelMask(region);
  const dilated = dilate(vectorMask, region.width, region.height, 2);
  const softened = erode(dilated, region.width, region.height, 1);

  return {
    raw: vectorMask,
    expanded: softened,
  };
}

function maskToRgba(mask: Uint8Array, width: number, height: number) {
  const output = new Uint8ClampedArray(width * height * 4);

  for (let index = 0; index < mask.length; index += 1) {
    const value = mask[index] ? 255 : 0;
    const offset = index * 4;
    output[offset] = value;
    output[offset + 1] = value;
    output[offset + 2] = value;
    output[offset + 3] = 255;
  }

  return output;
}

function writeMaskOntoCanvas(
  fullMask: Uint8Array,
  regionMask: Uint8Array,
  region: LabelRetouchRegion,
) {
  for (let y = 0; y < region.height; y += 1) {
    for (let x = 0; x < region.width; x += 1) {
      const localIndex = y * region.width + x;

      if (!regionMask[localIndex]) {
        continue;
      }

      const globalIndex =
        (region.y + y) * manualRetouchCanvas.width + (region.x + x);
      fullMask[globalIndex] = 1;
    }
  }
}

function getCropBox(region: LabelRetouchRegion) {
  const left = clamp(region.x - region.padding, 0, manualRetouchCanvas.width - 1);
  const top = clamp(region.y - region.padding, 0, manualRetouchCanvas.height - 1);
  const right = clamp(
    region.x + region.width + region.padding,
    1,
    manualRetouchCanvas.width,
  );
  const bottom = clamp(
    region.y + region.height + region.padding,
    1,
    manualRetouchCanvas.height,
  );

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

function buildGuideSvg(region: LabelRetouchRegion, crop: ReturnType<typeof getCropBox>) {
  const labelX = region.x - crop.left;
  const labelY = region.y - crop.top;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${crop.width}" height="${crop.height}" viewBox="0 0 ${crop.width} ${crop.height}">
      <rect x="${labelX}" y="${labelY}" width="${region.width}" height="${region.height}" fill="none" stroke="#f6d78a" stroke-width="4" rx="12" />
      <text x="${Math.max(24, labelX)}" y="${Math.max(36, labelY - 16)}" fill="#fff6e3" font-size="28" font-family="Georgia">${region.displayName}</text>
      <text x="20" y="${crop.height - 66}" fill="#f0e6d4" font-size="24" font-family="Georgia">Preservar: ${region.nearbyRisk.join(", ")}</text>
      <text x="20" y="${crop.height - 30}" fill="#d8c7a1" font-size="20" font-family="Georgia">Retoque somente dentro da mascara branca correspondente.</text>
    </svg>
  `;
}

function buildForbiddenPreviewSvg(
  regions: LabelRetouchRegion[],
  masks: Array<{ region: LabelRetouchRegion; expanded: Uint8Array }>,
) {
  const editablePaths = masks
    .map(({ region, expanded }) => {
      const polygons: string[] = [];

      for (let y = 0; y < region.height; y += 1) {
        let start = -1;

        for (let x = 0; x < region.width; x += 1) {
          const active = expanded[y * region.width + x] === 1;

          if (active && start === -1) {
            start = x;
          }

          const isEnd = start !== -1 && (!active || x === region.width - 1);

          if (isEnd) {
            const end = active && x === region.width - 1 ? x : x - 1;
            polygons.push(
              `<rect x="${region.x + start}" y="${region.y + y}" width="${Math.max(
                1,
                end - start + 1,
              )}" height="1" fill="#e3c673" opacity="0.92" />`,
            );
            start = -1;
          }
        }
      }

      return polygons.join("");
    })
    .join("");

  const boxes = regions
    .map(
      (region) => `
        <rect x="${region.x}" y="${region.y}" width="${region.width}" height="${region.height}" fill="none" stroke="#f7edd0" stroke-width="2" rx="8" />
        <text x="${region.x}" y="${Math.max(22, region.y - 12)}" fill="#fff7e4" font-size="22" font-family="Georgia">${region.displayName} (${region.x}, ${region.y}, ${region.width}, ${region.height})</text>
      `,
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${manualRetouchCanvas.width}" height="${manualRetouchCanvas.height}" viewBox="0 0 ${manualRetouchCanvas.width} ${manualRetouchCanvas.height}">
      <rect width="${manualRetouchCanvas.width}" height="${manualRetouchCanvas.height}" fill="rgba(5, 8, 10, 0.48)" />
      ${editablePaths}
      ${boxes}
      <rect x="18" y="18" width="720" height="108" rx="18" fill="rgba(8, 10, 12, 0.82)" stroke="rgba(240, 231, 210, 0.22)" />
      <text x="42" y="58" fill="#fff0cf" font-size="30" font-family="Georgia">Area editavel autorizada em dourado</text>
      <text x="42" y="92" fill="#e2d2ae" font-size="22" font-family="Georgia">Todo o restante do mapa deve permanecer protegido.</text>
    </svg>
  `;
}

async function writeImageFromRaw(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  targetPath: string,
) {
  await sharp(Buffer.from(data), {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toFile(targetPath);
}

async function createReadme() {
  const content = `# Retoque Manual do Mapa de Jadelon v0.1

1. Abra \`assets/derived/cartography/manual-retouch/v0.1/mapa-retouch-source.png\`.
2. Edite somente o que estiver autorizado por \`allowed-edit-mask.png\` e pelos pacotes em \`labels/\`.
3. Exporte um PNG com as mesmas dimensoes: \`2048 x 1536\`.
4. Devolva o arquivo final e valide com:

\`\`\`bash
npm run validate:manual-map -- /caminho/do/mapa-base-clean-manual.png
\`\`\`

O retorno nao aprova visualmente o mapa; ele apenas valida integridade tecnica e alteracoes fora da area permitida.
`;

  await fs.writeFile(readmePath, content, "utf8");
}

async function createInstructionFiles() {
  await fs.mkdir(manualRoot, { recursive: true });

  const instructions = `# Instrucoes de Retoque Manual

## Ferramentas suportadas

- Photoshop
- Photopea
- Affinity Photo
- GIMP

## Metodo recomendado

1. Trabalhar sempre em nova camada.
2. Usar Clone Stamp e Healing com baixa dureza.
3. Amostrar textura da mesma regiao.
4. Preservar direcao da textura.
5. Reconstruir montanhas e relevo somente por clonagem local.
6. Nao usar blur como acabamento.
7. Nao usar preenchimento generativo em costas, ilhas ou canais.
8. Nao alterar cor global.
9. Nao remover outros elementos.
10. Exportar PNG sem redimensionar.

## Orientacoes especificas

### Snøklem

- preservar textura de neve
- nao apagar montanhas proximas
- evitar mancha roxa residual

### Báaldrum

- preservar textura escura
- manter transicao com montanhas e costa
- remover vermelho, sombra e glow sem criar faixa horizontal

### Bergskrona

- preservar textura verde e relevo
- nao borrar as montanhas
- reconstruir variacoes de terreno

### Cathizar

- preservar textura clara de pergaminho/terra
- evitar bloco uniforme
- remover amarelo, sombra e glow

### Névérith

- maior cuidado por estar em massa estreita e ilhas
- nao alterar costa
- nao apagar ilhas
- usar amostras proximas da propria massa principal

### Xharas-Tor

- preservar textura escura e canais costeiros
- nao preencher enseadas
- nao alterar as pequenas massas proximas
`;

  const checklist = `# Checklist de Retorno

- [ ] arquivo final em PNG
- [ ] dimensoes identicas ao original: 2048 x 1536
- [ ] sem crop
- [ ] sem redimensionamento
- [ ] sem mudancas fora de allowed-edit-mask.png
- [ ] sem blur como acabamento
- [ ] sem preenchimento generativo em costas e ilhas
- [ ] sem remocao de relevo, montanhas ou massas proximas
- [ ] arquivo validado com scripts/validate-manual-map.ts
`;

  await fs.writeFile(
    path.join(manualRoot, "INSTRUCOES_RETOQUE_MANUAL.md"),
    instructions,
    "utf8",
  );
  await fs.writeFile(
    path.join(manualRoot, "CHECKLIST_RETORNO.md"),
    checklist,
    "utf8",
  );
}

async function createRetouchPackage() {
  await fs.mkdir(labelsRoot, { recursive: true });
  await fs.mkdir(reviewRoot, { recursive: true });

  const originalPngPath = path.join(manualRoot, "mapa-original-lossless.png");
  const sourcePngPath = path.join(manualRoot, "mapa-retouch-source.png");

  await sharp(originalJpgPath).png().toFile(originalPngPath);
  await fs.copyFile(originalPngPath, sourcePngPath);

  const fullMask = new Uint8Array(manualRetouchCanvas.width * manualRetouchCanvas.height);
  const regionMasks: Array<{ region: LabelRetouchRegion; expanded: Uint8Array }> = [];
  const labelsJson = [];

  for (const region of manualRetouchRegions) {
    const directory = path.join(labelsRoot, region.id);
    await fs.mkdir(directory, { recursive: true });

    const mask = await buildRegionMask(region);
    writeMaskOntoCanvas(fullMask, mask.expanded, region);
    regionMasks.push({ region, expanded: mask.expanded });

    const crop = getCropBox(region);
    const originalCropPath = path.join(directory, "context-original.png");
    await sharp(originalPngPath)
      .extract(crop)
      .png()
      .toFile(originalCropPath);

    const labelMaskPath = path.join(directory, "label-mask.png");
    await writeImageFromRaw(
      maskToRgba(mask.expanded, region.width, region.height),
      region.width,
      region.height,
      labelMaskPath,
    );

    const guideOverlay = Buffer.from(buildGuideSvg(region, crop));
    await sharp(originalCropPath)
      .composite([{ input: guideOverlay }])
      .png()
      .toFile(path.join(directory, "guide.png"));

    labelsJson.push({
      ...region,
    });
  }

  await writeImageFromRaw(
    maskToRgba(fullMask, manualRetouchCanvas.width, manualRetouchCanvas.height),
    manualRetouchCanvas.width,
    manualRetouchCanvas.height,
    path.join(manualRoot, "allowed-edit-mask.png"),
  );

  await sharp(originalPngPath)
    .composite([
      {
        input: Buffer.from(buildForbiddenPreviewSvg(manualRetouchRegions, regionMasks)),
      },
    ])
    .png()
    .toFile(path.join(manualRoot, "forbidden-edit-preview.png"));

  await fs.writeFile(
    path.join(manualRoot, "labels.json"),
    `${JSON.stringify(labelsJson, null, 2)}\n`,
    "utf8",
  );
}

async function createZip() {
  await fs.rm(zipPath, { force: true });

  await execFileAsync("zip", [
    "-r",
    zipPath,
    "assets/derived/cartography/manual-retouch/v0.1",
    "scripts/validate-manual-map.ts",
    "README_RETOQUE_MANUAL_MAPA_v0.1.md",
    "-x",
    "*.DS_Store",
    "*/._*",
  ], {
    cwd: repoRoot,
  });
}

async function main() {
  await createReadme();
  await createInstructionFiles();
  await createRetouchPackage();
  await createZip();

  console.log(
    JSON.stringify(
      {
        manualRoot: path.relative(repoRoot, manualRoot),
        zip: path.basename(zipPath),
        regions: manualRetouchRegions.length,
      },
      null,
      2,
    ),
  );
}

await main();
