import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { discoverableEntities } from "../../src/content/discoverable/entities.ts";
import { publicEntities } from "../../src/content/public/entities.ts";
import {
  getPublicEntityById,
  getPublicEntityBySlug,
  getPublicAssetById,
  publicAssets,
  publicEntitiesProjection,
  publicIndex,
} from "../../src/lib/content/public-runtime.ts";
import { validatePublicAssetRegistry } from "../../src/lib/assets/public-asset-validation.ts";
import {
  allValidatedEntities,
  getValidationEntityById,
  getValidationReport,
} from "../../src/lib/content/validation-runtime.ts";
import {
  forbiddenPublicCosmologyTerms,
  projectPublicEntities,
  validateAllDatasets,
  validatePublicDataset,
} from "../../src/lib/content/shared-validation.ts";
import { validationDiscoverableProjection } from "../../src/lib/content/validation-runtime.ts";
import {
  getOrbitAnglesForHotspot,
  isHotspotFacingCamera,
  latLonToVector3,
  prototypeGlobeCamera,
} from "../../src/lib/globe/prototype-points.ts";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

function cloneEntities<T>(entities: T): T {
  return structuredClone(entities);
}

function expectValidationFailure(
  callback: () => void,
  matcher: RegExp,
) {
  assert.throws(callback, matcher);
}

function collectFilesRecursively(directory: string, matcher: RegExp) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFilesRecursively(fullPath, matcher));
      continue;
    }

    if (matcher.test(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

test("validation report reflects the corrected representative dataset", () => {
  const report = getValidationReport();

  assert.equal(report.publicCount, publicEntities.length);
  assert.equal(report.discoverableCount, discoverableEntities.length);
  assert.equal(report.entityCount, publicEntities.length + discoverableEntities.length);
  assert.equal(report.slugCount, new Set(allValidatedEntities.map((entity) => entity.slug)).size);
  assert.ok(report.relationCount > 0);
});

test("public runtime excludes Helix and exposes explicit public lookup APIs only", () => {
  assert.equal(getPublicEntityById("record-helix-daggry"), undefined);
  assert.equal(getPublicEntityBySlug("helix-daggry"), undefined);
  assert.ok(publicIndex.every((entity) => entity.slug !== "helix-daggry"));
  assert.ok(publicEntitiesProjection.every((entity) => entity.id !== "record-helix-daggry"));
});

test("public projection strips internal metadata", () => {
  const projected = publicEntitiesProjection[0];

  assert.ok(projected);
  assert.equal("sources" in projected, false);
  assert.equal("visibility" in projected, false);
  assert.equal("canonStatus" in projected, false);
  assert.equal("body" in projected, false);
  assert.equal("media" in projected, true);
});

test("discoverable content remains outside the public runtime", () => {
  const helix = allValidatedEntities.find((entity) => entity.id === "record-helix-daggry");

  assert.ok(helix);
  assert.equal(helix.visibility, "discoverable");
});

test("Zan-Hau remains approved and confirmed", () => {
  const zanHau = getValidationEntityById("character-zan-hau");

  assert.ok(zanHau);
  assert.equal(zanHau.canonStatus, "approved");
  assert.equal(zanHau.recordState, "confirmed");
});

test("Guerra das Fendas remains bound to Era Política with confirmed years", () => {
  const guerra = getValidationEntityById("event-guerra-das-fendas");

  assert.ok(guerra);
  assert.deepEqual(guerra.temporal?.eraIds, ["era-politica"]);
  assert.equal(guerra.temporal?.yearStart, 6000);
  assert.equal(guerra.temporal?.yearEnd, 6040);
  assert.equal(guerra.temporal?.isUndated, undefined);
  assert.equal(
    guerra.relations.some(
      (relation) =>
        relation.type === "occurs-during" && relation.targetId === "era-politica",
    ),
    true,
  );
});

test("official public presentation names preserve UTF-8 spellings", () => {
  assert.equal(getPublicEntityById("continent-baaldrum")?.name, "Báaldrum");
  assert.equal(getPublicEntityById("continent-snoklem")?.name, "Snøklem");
  assert.equal(getPublicEntityById("era-politica")?.name, "Era Política");
});

test("public assets are validated and exposed through the runtime", () => {
  const assets = validatePublicAssetRegistry();

  assert.equal(assets.length, publicAssets.length);
  assert.ok(getPublicAssetById("map-shell-background"));
  assert.ok(getPublicAssetById("map-globe-prototype"));
  assert.equal(
    assets.every((asset) => asset.publicUrl.startsWith("/assets/jadelon/")),
    true,
  );
  assert.equal(
    assets.some((asset) => asset.publicUrl.includes("assets/reference/")),
    false,
  );
});

test("public entities reference asset ids instead of internal file paths", () => {
  const world = getPublicEntityById("world-jadelon");

  assert.ok(world);
  assert.equal(world.media[0]?.assetId, "map-shell-background");
  assert.equal("path" in world.media[0], false);
});

test("discoverable projection strips internal metadata", () => {
  const helix = validationDiscoverableProjection.find(
    (entity) => entity.id === "record-helix-daggry",
  );

  assert.ok(helix);
  assert.equal("sources" in helix, false);
  assert.equal("visibility" in helix, false);
  assert.equal("canonStatus" in helix, false);
  assert.equal("body" in helix, false);
});

test("fails on duplicate entity ID", () => {
  const invalidPublic = cloneEntities(publicEntities);
  invalidPublic.push({ ...cloneEntities(publicEntities[0]) });

  expectValidationFailure(
    () => validateAllDatasets(invalidPublic, discoverableEntities),
    /Duplicate entity id/,
  );
});

test("fails on duplicate slug", () => {
  const invalidPublic = cloneEntities(publicEntities);
  invalidPublic.push({
    ...cloneEntities(publicEntities[0]),
    id: "world-jadelon-duplicate",
  });

  expectValidationFailure(
    () => validateAllDatasets(invalidPublic, discoverableEntities),
    /Duplicate slug/,
  );
});

test("fails on relation with missing target", () => {
  const invalidPublic = cloneEntities(publicEntities);
  invalidPublic[0].relations.push({
    type: "contains",
    targetId: "missing-entity",
  });

  expectValidationFailure(
    () => validateAllDatasets(invalidPublic, discoverableEntities),
    /references missing target/,
  );
});

test("fails when a public entity references a missing asset", () => {
  const invalidPublic = cloneEntities(publicEntities);
  invalidPublic[0].media[0] = {
    kind: "map",
    assetId: "missing-asset",
    alt: "Asset invalido",
  };

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /references missing public asset/,
  );
});

test("fails on conflict without contested record state", () => {
  const invalidPublic = cloneEntities(publicEntities);
  invalidPublic[0].canonStatus = "conflict";
  invalidPublic[0].recordState = "confirmed";

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /must declare recordState "contested"/,
  );
});

test("fails when a non-public entity appears in publicEntities", () => {
  const invalidPublic = cloneEntities(publicEntities);
  invalidPublic[0].visibility = "discoverable";

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /must use visibility "public"/,
  );
});

test("fails when a public entity points to discoverable content", () => {
  const invalidPublic = cloneEntities(publicEntities);
  invalidPublic[0].relations.push({
    type: "associated-with",
    targetId: "record-helix-daggry",
  });

  expectValidationFailure(
    () => validateAllDatasets(invalidPublic, discoverableEntities),
    /cannot point to non-public target/,
  );
});

test("fails when a semantic relation is incompatible", () => {
  const invalidPublic = cloneEntities(publicEntities);
  const casaDregarr = invalidPublic.find((entity) => entity.id === "org-casa-dregarr");

  assert.ok(casaDregarr);
  casaDregarr.relations.push({
    type: "ruled-by",
    targetId: "event-guerra-das-fendas",
  });

  expectValidationFailure(
    () => validateAllDatasets(invalidPublic, discoverableEntities),
    /incompatible target/,
  );
});

test("fails when relation origin type is incompatible for occurs-during", () => {
  const invalidPublic = cloneEntities(publicEntities);
  const eraPolitica = invalidPublic.find((entity) => entity.id === "era-politica");

  assert.ok(eraPolitica);
  eraPolitica.relations.push({
    type: "occurs-during",
    targetId: "era-primeira-era",
  });

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /cannot use relation "occurs-during"/,
  );
});

test("no source or runtime file leaks secret terms into the public content surface", () => {
  const contentRoots = [
    path.join(repoRoot, "src/content/public"),
    path.join(repoRoot, "src/app"),
    path.join(repoRoot, "src/components"),
  ];

  const leakedFiles = contentRoots.flatMap((root) =>
    collectFilesRecursively(root, /\.(ts|tsx|md)$/),
  );

  for (const file of leakedFiles) {
    const content = fs.readFileSync(file, "utf8");

    for (const term of forbiddenPublicCosmologyTerms) {
      assert.equal(
        content.includes(term),
        false,
        `Forbidden term "${term}" leaked into ${file}`,
      );
    }
  }
});

test("fails when relation origin type is incompatible for located-in", () => {
  const invalidPublic = cloneEntities(publicEntities);
  const world = invalidPublic.find((entity) => entity.id === "world-jadelon");

  assert.ok(world);
  world.relations.push({
    type: "located-in",
    targetId: "continent-baaldrum",
  });

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /cannot use relation "located-in"/,
  );
});

test("fails when forbidden cosmology terms enter src/content/public", () => {
  const invalidPublic = cloneEntities(publicEntities);
  invalidPublic[0].summary = `${invalidPublic[0].summary} ${forbiddenPublicCosmologyTerms[0]}`;

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /forbidden cosmology term/,
  );
});

test("public projection contains no editorial metadata", () => {
  const projected = projectPublicEntities(publicEntities);
  const containsInternalMetadata = projected.some((entity) =>
    ["sources", "visibility", "canonStatus", "body"].some((field) => field in entity),
  );

  assert.equal(containsInternalMetadata, false);
});

test("fails when Guerra das Fendas leaves Era Política", () => {
  const invalidPublic = cloneEntities(publicEntities);
  const guerra = invalidPublic.find((entity) => entity.id === "event-guerra-das-fendas");

  assert.ok(guerra);
  guerra.temporal = {
    eraIds: ["era-primeira-era"],
    yearStart: 6000,
    yearEnd: 6040,
  };
  guerra.relations = guerra.relations.filter(
    (relation) => relation.type !== "occurs-during",
  );

  expectValidationFailure(
    () => validateAllDatasets(invalidPublic, discoverableEntities),
    /must occur during "era-politica"|must list "era-politica"/,
  );
});

test("fails when isUndated is combined with yearStart", () => {
  const invalidPublic = cloneEntities(publicEntities);
  const guerra = invalidPublic.find((entity) => entity.id === "event-guerra-das-fendas");

  assert.ok(guerra);
  guerra.temporal = {
    eraIds: ["era-politica"],
    yearStart: 6000,
    isUndated: true,
  };

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /cannot combine isUndated with yearStart/,
  );
});

test("fails when yearEnd is smaller than yearStart", () => {
  const invalidPublic = cloneEntities(publicEntities);
  const guerra = invalidPublic.find((entity) => entity.id === "event-guerra-das-fendas");

  assert.ok(guerra);
  guerra.temporal = {
    eraIds: ["era-politica"],
    yearStart: 6040,
    yearEnd: 6000,
  };

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /yearEnd smaller than yearStart/,
  );
});

test("fails when eraIds points to a missing entity", () => {
  const invalidPublic = cloneEntities(publicEntities);
  invalidPublic[0].temporal = {
    eraIds: ["missing-era"],
  };

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /references missing era/,
  );
});

test("fails when eraIds points to a non-era entity", () => {
  const invalidPublic = cloneEntities(publicEntities);
  invalidPublic[0].temporal = {
    eraIds: ["continent-baaldrum"],
  };

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /references non-era temporal target/,
  );
});

test("fails when continentId points to a non-continent entity", () => {
  const invalidPublic = cloneEntities(publicEntities);
  const brannslott = invalidPublic.find((entity) => entity.id === "kingdom-brannslott");

  assert.ok(brannslott);
  brannslott.geography = {
    continentId: "org-casa-dregarr",
  };

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /references non-continent geography target/,
  );
});

test("fails when parentPlaceId points to a non-geographic entity", () => {
  const invalidPublic = cloneEntities(publicEntities);
  const brannslott = invalidPublic.find((entity) => entity.id === "kingdom-brannslott");

  assert.ok(brannslott);
  brannslott.geography = {
    continentId: "continent-snoklem",
    parentPlaceId: "org-casa-dregarr",
  };

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /references non-geographic parent place/,
  );
});

test("fails when technical prototype coordinates use non-prototype precision", () => {
  const invalidPublic = cloneEntities(publicEntities);
  const baaldrum = invalidPublic.find((entity) => entity.id === "continent-baaldrum");

  assert.ok(baaldrum?.technical?.prototypeMapPoint);
  baaldrum.technical.prototypeMapPoint.precision = "exact";

  expectValidationFailure(
    () => validatePublicDataset(invalidPublic),
    /must use prototype precision/,
  );
});

test("prototype globe exposes six approved continents with prototype globe coordinates", () => {
  const hotspotIds = [
    "continent-bergskrona",
    "continent-baaldrum",
    "continent-snoklem",
    "continent-cathizar",
    "continent-neverith",
    "continent-xharas-tor",
  ];

  for (const hotspotId of hotspotIds) {
    const entity = getValidationEntityById(hotspotId);

    assert.ok(entity, `Missing ${hotspotId}`);
    assert.equal(entity.visibility, "public");
    assert.equal(entity.technical?.prototypeGlobePoint?.precision, "prototype");
  }
});

test("prototype globe camera stays outside the sphere with valid zoom limits", () => {
  assert.ok(prototypeGlobeCamera.distance > 1);
  assert.ok(prototypeGlobeCamera.minDistance > 1);
  assert.ok(prototypeGlobeCamera.maxDistance > prototypeGlobeCamera.minDistance);
  assert.ok(prototypeGlobeCamera.far > prototypeGlobeCamera.distance);
});

test("prototype globe lat/lon points project to 3D vectors on the sphere", () => {
  const points = [
    latLonToVector3(48.4, -77.6, 1.02),
    latLonToVector3(2.5, -31.8, 1.02),
    latLonToVector3(-55.8, 74.1, 1.02),
  ];

  for (const point of points) {
    const length = Math.hypot(...point);
    assert.ok(length > 1 && length < 1.03);
  }
});

test("prototype globe orbit angles are finite for the six hotspots", () => {
  const hotspots = [
    [48.4, -77.6],
    [2.5, -31.8],
    [-52.2, -62.6],
    [57.6, 57.3],
    [1.8, 50.4],
    [-55.8, 74.1],
  ] as const;

  for (const [latitude, longitude] of hotspots) {
    const orbit = getOrbitAnglesForHotspot(latitude, longitude);

    assert.equal(Number.isFinite(orbit.azimuthalAngle), true);
    assert.equal(Number.isFinite(orbit.polarAngle), true);
  }
});

test("hotspot facing helper distinguishes front and back hemispheres", () => {
  const front = latLonToVector3(0, 0, 1.02);
  const back = latLonToVector3(0, 180, 1.02);
  const cameraPosition = [0, 0, prototypeGlobeCamera.distance] as const;

  assert.equal(isHotspotFacingCamera(front, cameraPosition), true);
  assert.equal(isHotspotFacingCamera(back, cameraPosition), false);
});

test("public runtime does not import discoverable modules", () => {
  const runtimeSource = fs.readFileSync(
    path.join(repoRoot, "src/lib/content/public-runtime.ts"),
    "utf8",
  );

  assert.equal(runtimeSource.includes("discoverable-runtime.server"), false);
  assert.equal(runtimeSource.includes("discoverable/entities"), false);
});

test("client code does not import the discoverable runtime", () => {
  const filesToCheck = [
    ...collectFilesRecursively(path.join(repoRoot, "src/app"), /\.(ts|tsx)$/),
    ...collectFilesRecursively(path.join(repoRoot, "src/components"), /\.(ts|tsx)$/),
  ];

  for (const file of filesToCheck) {
    const source = fs.readFileSync(file, "utf8");
    assert.equal(
      source.includes("discoverable-runtime.server"),
      false,
      `${file} should not import the discoverable runtime`,
    );
  }
});

test("discoverable runtime is server-only", () => {
  const source = fs.readFileSync(
    path.join(repoRoot, "src/lib/content/discoverable-runtime.server.ts"),
    "utf8",
  );

  assert.equal(source.includes('import "server-only";'), true);
});

test("no test or runtime file contains local absolute machine paths", () => {
  const volumesFragment = ["/", "Volumes", "/"].join("");
  const diskNameFragment = ["FOCAR", " SSD"].join("");
  const filesToCheck = [
    path.join(repoRoot, "tests/unit/content-validation.test.ts"),
    path.join(repoRoot, "src/lib/content/public-runtime.ts"),
    path.join(repoRoot, "src/lib/content/discoverable-runtime.server.ts"),
    path.join(repoRoot, "src/lib/content/validation-runtime.ts"),
  ];

  for (const file of filesToCheck) {
    const source = fs.readFileSync(file, "utf8");
    assert.equal(source.includes(volumesFragment), false);
    assert.equal(source.includes(diskNameFragment), false);
  }
});
