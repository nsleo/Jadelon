import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { getPublicAssetById } from "../../src/lib/content/public-runtime.ts";
import {
  resolvePublicGlobeAutoRotate,
  resolvePublicGlobeState,
  shouldEnablePublicGlobe3D,
} from "../../src/lib/globe/public-globe-runtime.ts";

test("production registry exposes the promoted P60 globe and atlas assets", () => {
  const globe = getPublicAssetById("map-globe-jadelon-v1");
  const atlas = getPublicAssetById("map-atlas-jadelon-v1");

  assert.ok(globe);
  assert.ok(atlas);
  assert.equal(globe.status, "production");
  assert.equal(globe.sourceAssetId, "mapa-globo-projection-p60");
  assert.equal(globe.publicUrl.includes("/candidates/"), false);
  assert.equal(globe.fallbackAssetId, "map-atlas-jadelon-v1");
  assert.equal(globe.projectionKey, "p60");
  assert.equal(atlas.status, "production");
  assert.equal(atlas.sourceAssetId, "mapa-atlas-clean-source-candidate");
  assert.equal(atlas.publicUrl.includes("/candidates/"), false);
});

test("public globe prefers 2D fallback when WebGL is unavailable or fallback is required", () => {
  assert.equal(
    shouldEnablePublicGlobe3D({
      prefersFallback: false,
      webglFailed: false,
      webglSupported: true,
    }),
    true,
  );
  assert.equal(
    shouldEnablePublicGlobe3D({
      prefersFallback: true,
      webglFailed: false,
      webglSupported: true,
    }),
    false,
  );
  assert.equal(
    shouldEnablePublicGlobe3D({
      prefersFallback: false,
      webglFailed: true,
      webglSupported: true,
    }),
    false,
  );
  assert.equal(
    resolvePublicGlobeState({
      hasReadyTexture: false,
      prefersFallback: true,
      webglFailed: false,
      webglSupported: true,
    }),
    "ready-2d",
  );
});

test("reduced motion disables public auto-rotation without disabling the visual block", () => {
  assert.equal(
    resolvePublicGlobeAutoRotate({
      interactionActive: false,
      reducedMotion: false,
      webglEnabled: true,
    }),
    "on",
  );
  assert.equal(
    resolvePublicGlobeAutoRotate({
      interactionActive: false,
      reducedMotion: true,
      webglEnabled: true,
    }),
    "off",
  );
  assert.equal(
    resolvePublicGlobeAutoRotate({
      interactionActive: true,
      reducedMotion: false,
      webglEnabled: true,
    }),
    "off",
  );
});

test("public globe layer does not reference candidate projections or lab controls", () => {
  const publicComponent = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/globe/jadelon-globe-public.tsx"),
    "utf8",
  );
  const homeSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/home-page.tsx"),
    "utf8",
  );

  assert.doesNotMatch(publicComponent, /mapa-globo-projection-p55|mapa-globo-projection-p65/);
  assert.doesNotMatch(publicComponent, /GlobeLabControls|Renderer|Checksum|Projection/);
  assert.match(homeSource, /JadelonGlobeLoader priority publicMode/);
});
