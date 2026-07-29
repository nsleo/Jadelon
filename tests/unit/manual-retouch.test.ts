import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import {
  manualRetouchCanvas,
  manualRetouchRegions,
} from "../../src/lib/cartography/manual-retouch-config.ts";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const manualRoot = path.join(
  repoRoot,
  "assets/derived/cartography/manual-retouch/v0.1",
);
const zipPath = path.join(repoRoot, "JADELON_RETOQUE_MANUAL_MAPA_v0.1.zip");
const sourcePath = path.join(manualRoot, "mapa-retouch-source.png");
const originalLosslessPath = path.join(manualRoot, "mapa-original-lossless.png");
const allowedMaskPath = path.join(manualRoot, "allowed-edit-mask.png");
const tempRoot = path.join(repoRoot, "artifacts", "tmp-tests");

async function maskCoverage(filePath: string) {
  const stats = await sharp(filePath).stats();

  return stats.channels[0].mean / 255;
}

async function writeTempVariant(
  name: string,
  mutate: (data: Uint8Array, width: number, height: number) => void,
) {
  await fs.promises.mkdir(tempRoot, { recursive: true });
  const tempDir = await fs.promises.mkdtemp(path.join(tempRoot, "jadelon-manual-"));
  const targetPath = path.join(tempDir, name);
  const source = sharp(sourcePath).ensureAlpha();
  const raw = await source.raw().toBuffer({ resolveWithObject: true });
  const data = new Uint8Array(raw.data.buffer, raw.data.byteOffset, raw.data.byteLength);

  mutate(data, raw.info.width, raw.info.height);

  await sharp(Buffer.from(data), {
    raw: {
      width: raw.info.width,
      height: raw.info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(targetPath);

  return {
    tempDir,
    targetPath,
  };
}

test("manual retouch lossless source preserves original dimensions", async () => {
  const metadata = await sharp(originalLosslessPath).metadata();

  assert.equal(metadata.width, manualRetouchCanvas.width);
  assert.equal(metadata.height, manualRetouchCanvas.height);
  assert.equal(metadata.format, "png");
});

test("manual retouch defines six named regions and matching label packages", () => {
  assert.equal(manualRetouchRegions.length, 6);
  const labelsJson = JSON.parse(
    fs.readFileSync(path.join(manualRoot, "labels.json"), "utf8"),
  ) as Array<{ id: string; displayName: string }>;
  const expectedNames = new Set([
    "Snøklem",
    "Báaldrum",
    "Bergskrona",
    "Cathizar",
    "Névérith",
    "Xharas-Tor",
  ]);

  for (const region of manualRetouchRegions) {
    assert.ok(region.displayName.length > 0);
    assert.ok(region.width > 0);
    assert.ok(region.height > 0);
    assert.ok(region.x >= 0);
    assert.ok(region.y >= 0);

    const labelDir = path.join(manualRoot, "labels", region.id);
    assert.equal(fs.existsSync(path.join(labelDir, "context-original.png")), true);
    assert.equal(fs.existsSync(path.join(labelDir, "label-mask.png")), true);
    assert.equal(fs.existsSync(path.join(labelDir, "guide.png")), true);
    assert.equal(expectedNames.has(region.displayName), true);
  }

  assert.equal(labelsJson.length, 6);
  assert.equal(labelsJson.every((entry) => expectedNames.has(entry.displayName)), true);
});

test("manual retouch label masks are non-empty and crop boxes stay inside the map", async () => {
  for (const region of manualRetouchRegions) {
    const labelMaskPath = path.join(manualRoot, "labels", region.id, "label-mask.png");
    const metadata = await sharp(labelMaskPath).metadata();

    assert.equal(metadata.width, region.width);
    assert.equal(metadata.height, region.height);
    assert.ok((await maskCoverage(labelMaskPath)) > 0.001);

    assert.ok(region.x + region.width <= manualRetouchCanvas.width);
    assert.ok(region.y + region.height <= manualRetouchCanvas.height);
  }
});

test("allowed edit mask stays narrow and does not cover excessive area", async () => {
  const coverage = await maskCoverage(allowedMaskPath);

  assert.ok(coverage > 0.002);
  assert.ok(coverage < 0.08);
});

test("manual map validator accepts an unchanged PNG", () => {
  const output = execFileSync(
    "node",
    [
      "--experimental-strip-types",
      "scripts/validate-manual-map.ts",
      sourcePath,
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  );

  assert.match(output, /"accepted": true/);
});

test("manual map validator rejects a wrong-dimension PNG", async () => {
  await fs.promises.mkdir(tempRoot, { recursive: true });
  const tempDir = await fs.promises.mkdtemp(path.join(tempRoot, "jadelon-manual-size-"));
  const resizedPath = path.join(tempDir, "wrong-size.png");
  await sharp(sourcePath).resize(1024, 768).png().toFile(resizedPath);

  assert.throws(
    () =>
      execFileSync(
        "node",
        [
          "--experimental-strip-types",
          "scripts/validate-manual-map.ts",
          resizedPath,
        ],
        {
          cwd: repoRoot,
          encoding: "utf8",
          stdio: "pipe",
        },
      ),
    /dimensions must match/,
  );
});

test("manual map validator rejects a structural change outside the allowed mask", async () => {
  const variant = await writeTempVariant("outside-mask.png", (data, width) => {
    const offset = (24 * width + 24) * 4;
    data[offset] = 255;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
    data[offset + 3] = 255;
  });

  assert.throws(
    () =>
      execFileSync(
        "node",
        [
          "--experimental-strip-types",
          "scripts/validate-manual-map.ts",
          variant.targetPath,
        ],
        {
          cwd: repoRoot,
          encoding: "utf8",
          stdio: "pipe",
        },
      ),
    /outside the allowed edit mask/,
  );
});

test("zip contains only the allowed handoff files", () => {
  const entries = execFileSync("unzip", ["-Z1", zipPath], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);

  assert.ok(entries.length > 0);
  assert.equal(
    entries.every(
      (entry) =>
        entry.startsWith("assets/derived/cartography/manual-retouch/v0.1/") ||
        entry === "scripts/validate-manual-map.ts" ||
        entry === "README_RETOQUE_MANUAL_MAPA_v0.1.md",
    ),
    true,
  );
  assert.equal(entries.some((entry) => entry.includes("node_modules")), false);
  assert.equal(entries.some((entry) => entry.includes(".next")), false);
  assert.equal(entries.some((entry) => entry.includes("candidates")), false);
});
