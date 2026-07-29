import fs from "node:fs";
import path from "node:path";

import { publicAssetRegistry } from "./public-asset-registry.ts";
import type { PublicAsset } from "../../types/assets.ts";

const publicRoot = path.resolve(process.cwd(), "public");
const forbiddenPathFragments = [
  "../",
  "docs/",
  "assets/reference/",
  "assets/derived/",
  "file://",
  "/Users/",
  "/Volumes/",
  "C:\\",
];

function assertUniqueAssetIds(assets: PublicAsset[]) {
  const seen = new Set<string>();

  for (const asset of assets) {
    if (seen.has(asset.id)) {
      throw new Error(`Duplicate public asset id detected: "${asset.id}".`);
    }

    seen.add(asset.id);
  }
}

function assertValidPublicUrl(asset: PublicAsset) {
  if (!asset.publicUrl.startsWith("/assets/jadelon/")) {
    throw new Error(
      `Asset "${asset.id}" must use a publicUrl starting with "/assets/jadelon/".`,
    );
  }

  for (const fragment of forbiddenPathFragments) {
    if (asset.publicUrl.includes(fragment)) {
      throw new Error(
        `Asset "${asset.id}" uses forbidden publicUrl fragment "${fragment}".`,
      );
    }
  }
}

function assertPublicFileExists(asset: PublicAsset) {
  const relativeUrl = asset.publicUrl.replace(/^\//, "");
  const absolutePath = path.join(publicRoot, relativeUrl);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Asset "${asset.id}" references missing public file "${asset.publicUrl}".`,
    );
  }
}

export function validatePublicAssetRegistry() {
  assertUniqueAssetIds(publicAssetRegistry);

  for (const asset of publicAssetRegistry) {
    assertValidPublicUrl(asset);
    assertPublicFileExists(asset);
  }

  return publicAssetRegistry;
}
