import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

import { publicEntities } from "../../content/public/entities.ts";
import {
  cartographyCandidateAssets,
  supersededCartographyAssetIds,
} from "./candidate-assets.ts";
import {
  candidateContinentShapes,
  getShapePolygonSets,
} from "./continent-shapes.ts";

const cleanSourceRelativePath = "assets/reference/mapa-mundi-original-sem-labels.png";
const cartographyReportRelativePath = "artifacts/review/cartography-generation-report.json";

function polygonArea(points: Array<{ x: number; y: number }>) {
  let area = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area / 2);
}

async function readCartographyReport(repoRoot: string) {
  const reportPath = path.join(repoRoot, cartographyReportRelativePath);

  if (!fs.existsSync(reportPath)) {
    throw new Error("Missing cartography generation report.");
  }

  return JSON.parse(await fs.promises.readFile(reportPath, "utf8")) as {
    sourceValidation: {
      clean: {
        format: string;
      };
      labelChecks: Array<{
        id: string;
        passed: boolean;
      }>;
      outsideDifferenceRatio: number;
    };
    supersededAssetIds: string[];
    projectionProfiles: Array<{
      assetId: string;
      latitudeBand: number;
      textureWidth: number;
      textureHeight: number;
      projectedMapWidth: number;
      projectedMapHeight: number;
      topPadding: number;
      bottomPadding: number;
      leftPadding: number;
      rightPadding: number;
      scaleApplied: number;
      seamDelta: number;
    }>;
    maskReports: Array<{
      id: string;
      sourceAssetId: string;
      coverage: number;
    }>;
  };
}

export function validateContinentShapes() {
  const seen = new Set<string>();
  const publicContinents = publicEntities.filter((entity) =>
    entity.id.startsWith("continent-"),
  );

  if (candidateContinentShapes.length !== 6) {
    throw new Error("Candidate cartography must define exactly six continent shapes.");
  }

  for (const shape of candidateContinentShapes) {
    if (seen.has(shape.id)) {
      throw new Error(`Duplicate cartography shape id detected: "${shape.id}".`);
    }

    seen.add(shape.id);

    const publicEntity = publicContinents.find((entity) => entity.id === shape.id);

    if (!publicEntity) {
      throw new Error(`Cartography shape "${shape.id}" has no public entity match.`);
    }

    if (publicEntity.name !== shape.name) {
      throw new Error(
        `Cartography shape "${shape.id}" name "${shape.name}" must match public entity "${publicEntity.name}".`,
      );
    }

    if (shape.sourceAssetId !== "mapa-atlas-clean-source-candidate") {
      throw new Error(`Cartography shape "${shape.id}" must point to the clean atlas candidate.`);
    }

    for (const polygon of getShapePolygonSets(shape)) {
      if (polygon.length < 3) {
        throw new Error(`Cartography shape "${shape.id}" contains an invalid polygon.`);
      }

      for (const point of polygon) {
        if (
          point.x < 0 ||
          point.y < 0 ||
          point.x > shape.coordinateSpace.width ||
          point.y > shape.coordinateSpace.height
        ) {
          throw new Error(`Cartography shape "${shape.id}" contains out-of-bounds points.`);
        }
      }
    }
  }

  return {
    count: candidateContinentShapes.length,
    publicMatches: publicContinents.length,
  };
}

export async function validateCartographyCandidateFiles(repoRoot = process.cwd()) {
  const cleanSourcePath = path.join(repoRoot, cleanSourceRelativePath);

  if (!fs.existsSync(cleanSourcePath)) {
    throw new Error("Missing clean source map.");
  }

  const cleanSourceMetadata = await sharp(cleanSourcePath).metadata();

  if (cleanSourceMetadata.format !== "png") {
    throw new Error("Clean source map must be PNG.");
  }

  if (cleanSourceMetadata.width !== 2048 || cleanSourceMetadata.height !== 1536) {
    throw new Error("Clean source map dimensions must remain 2048x1536.");
  }

  for (const asset of cartographyCandidateAssets) {
    const absolutePath = path.join(repoRoot, asset.relativePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Missing cartography candidate asset "${asset.id}".`);
    }

    if (asset.width && asset.height) {
      const metadata = await sharp(absolutePath).metadata();

      if (metadata.width !== asset.width || metadata.height !== asset.height) {
        throw new Error(
          `Cartography asset "${asset.id}" expected ${asset.width}x${asset.height} but found ${metadata.width}x${metadata.height}.`,
        );
      }
    }
  }

  for (const shape of candidateContinentShapes) {
    const maskPath = path.join(
      repoRoot,
      "assets/derived/cartography/candidates/masks",
      `${shape.slug}-mask.png`,
    );

    if (!fs.existsSync(maskPath)) {
      throw new Error(`Missing continent mask for "${shape.slug}".`);
    }

    const image = sharp(maskPath);
    const metadata = await image.metadata();
    const stats = await image.stats();

    if (metadata.width !== 2048 || metadata.height !== 1536) {
      throw new Error(`Mask "${shape.slug}" must stay in the original coordinate space.`);
    }

    if (!metadata.hasAlpha) {
      throw new Error(`Mask "${shape.slug}" must preserve an alpha channel.`);
    }

    const alpha = stats.channels[3];

    if (!alpha || alpha.max <= 0) {
      throw new Error(`Mask "${shape.slug}" is empty.`);
    }

    const coverage = alpha.mean / 255;

    if (coverage < 0.005) {
      throw new Error(`Mask "${shape.slug}" coverage is too small to be useful.`);
    }

    if (coverage > 0.6) {
      throw new Error(`Mask "${shape.slug}" coverage is unrealistically high.`);
    }

    const polygons = getShapePolygonSets(shape);
    const polygonCoverage =
      polygons.reduce((sum, polygon) => sum + polygonArea(polygon), 0) / (2048 * 1536);

    if (polygonCoverage < 0.005 || polygonCoverage > 0.9) {
      throw new Error(`Shape "${shape.slug}" polygon coverage is out of expected range.`);
    }
  }

  const report = await readCartographyReport(repoRoot);

  if (report.sourceValidation.clean.format !== "png") {
    throw new Error("Cartography report must confirm the clean source as PNG.");
  }

  if (report.sourceValidation.labelChecks.some((entry) => !entry.passed)) {
    throw new Error("Cartography report indicates unresolved label regions.");
  }

  if (report.sourceValidation.outsideDifferenceRatio > 0.05) {
    throw new Error("Clean source diverges too much from the original outside label regions.");
  }

  if (
    supersededCartographyAssetIds.some(
      (assetId) => !report.supersededAssetIds.includes(assetId),
    )
  ) {
    throw new Error("Superseded cartography assets must remain recorded as historical only.");
  }

  if (report.projectionProfiles.length !== 3) {
    throw new Error("Cartography report must contain exactly three projection profiles.");
  }

  for (const profile of report.projectionProfiles) {
    if (profile.textureWidth !== 4096 || profile.textureHeight !== 2048) {
      throw new Error(`Projection "${profile.assetId}" must remain 4096x2048.`);
    }

    if (Math.abs(profile.leftPadding - profile.rightPadding) > 1) {
      throw new Error(`Projection "${profile.assetId}" is not horizontally centered.`);
    }

    if (Math.abs(profile.topPadding - profile.bottomPadding) > 1) {
      throw new Error(`Projection "${profile.assetId}" is not vertically centered.`);
    }

    if (profile.topPadding <= 0 || profile.bottomPadding <= 0) {
      throw new Error(`Projection "${profile.assetId}" touches a pole.`);
    }

    if (profile.leftPadding <= 0 || profile.rightPadding <= 0) {
      throw new Error(`Projection "${profile.assetId}" must keep technical ocean on both sides.`);
    }
  }

  if (
    report.maskReports.some(
      (mask) => mask.sourceAssetId !== "mapa-atlas-clean-source-candidate",
    )
  ) {
    throw new Error("Mask reports must point to the clean atlas candidate.");
  }

  return {
    assets: cartographyCandidateAssets.length,
    masks: report.maskReports.length,
    projections: report.projectionProfiles.length,
  };
}
