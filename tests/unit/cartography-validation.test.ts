import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import { candidateContinentShapes } from "../../src/lib/cartography/continent-shapes.ts";
import {
  cartographyCandidateAssets,
  supersededCartographyAssetIds,
} from "../../src/lib/cartography/candidate-assets.ts";
import {
  validateCartographyCandidateFiles,
  validateContinentShapes,
} from "../../src/lib/cartography/validation.ts";
import { publicAssets } from "../../src/lib/content/public-runtime.ts";

const repoRoot = process.cwd();
const reportPath = path.join(
  repoRoot,
  "artifacts/review/cartography-generation-report.json",
);

test("cartography shapes remain bounded, unique and aligned with the six public continents", () => {
  const report = validateContinentShapes();

  assert.equal(report.count, 6);
  assert.equal(candidateContinentShapes.length, 6);
  assert.equal(
    candidateContinentShapes.every(
      (shape) => shape.sourceAssetId === "mapa-atlas-clean-source-candidate",
    ),
    true,
  );
});

test("cartography candidates stay outside the public asset runtime", () => {
  assert.equal(
    publicAssets.some((asset) => asset.publicUrl.includes("/candidates/")),
    false,
  );
  assert.equal(
    cartographyCandidateAssets.every((asset) => asset.status === "candidate"),
    true,
  );
});

test("projection candidates keep distinct identities and clean-source lineage", () => {
  const projectionAssets = cartographyCandidateAssets.filter(
    (asset) => asset.kind === "texture",
  );

  assert.deepEqual(
    projectionAssets.map((asset) => asset.sourceAssetId),
    [
      "mapa-mundi-original-sem-labels",
      "mapa-mundi-original-sem-labels",
      "mapa-mundi-original-sem-labels",
    ],
  );
  assert.equal(
    new Set(projectionAssets.map((asset) => asset.checksum)).size,
    3,
  );
  assert.deepEqual(
    projectionAssets.map((asset) => asset.projectionKey),
    ["p55", "p60", "p65"],
  );
});

test("cartography report records the clean source transition and superseded assets", async () => {
  const report = JSON.parse(await fs.readFile(reportPath, "utf8")) as {
    sourceValidation: {
      clean: {
        origin: string;
      };
      labelChecks: Array<{
        passed: boolean;
      }>;
    };
    supersededAssetIds: string[];
    projectionProfiles: Array<{
      assetId: string;
      latitudeBand: number;
      topPadding: number;
      bottomPadding: number;
      leftPadding: number;
      rightPadding: number;
    }>;
  };

  assert.equal(
    report.sourceValidation.clean.origin,
    "assets/reference/mapa-mundi-original-sem-labels.png",
  );
  assert.equal(report.sourceValidation.labelChecks.every((entry) => entry.passed), true);
  assert.deepEqual(
    report.supersededAssetIds.sort(),
    [...supersededCartographyAssetIds].sort(),
  );
  assert.deepEqual(
    report.projectionProfiles.map((profile) => profile.latitudeBand),
    [55, 60, 65],
  );
  assert.equal(
    report.projectionProfiles.every(
      (profile) =>
        profile.topPadding > 0 &&
        profile.bottomPadding > 0 &&
        profile.leftPadding > 0 &&
        profile.rightPadding > 0,
    ),
    true,
  );
});

test("cartography calibration route keeps candidate projections separate from the prototype texture", async () => {
  const calibrationSource = await fs.readFile(
    path.join(repoRoot, "src/components/cartography/cartography-calibration.tsx"),
    "utf8",
  );

  assert.match(calibrationSource, /mapa-globo-projection-p55/);
  assert.match(calibrationSource, /mapa-globo-projection-p60/);
  assert.match(calibrationSource, /mapa-globo-projection-p65/);
});

test("cartography candidate files exist with masks, reports and expected projection metadata", async () => {
  const report = await validateCartographyCandidateFiles();

  assert.equal(report.assets, 5);
  assert.equal(report.masks, 6);
  assert.equal(report.projections, 3);
});
