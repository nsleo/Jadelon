import type { GlobeRenderState } from "@/components/globe/types";

export function shouldEnablePublicGlobe3D({
  prefersFallback,
  webglFailed,
  webglSupported,
}: {
  prefersFallback: boolean;
  webglSupported: boolean;
  webglFailed: boolean;
}) {
  return webglSupported && !prefersFallback && !webglFailed;
}

export function resolvePublicGlobeState({
  hasReadyTexture,
  prefersFallback,
  webglFailed,
  webglSupported,
}: {
  hasReadyTexture: boolean;
  prefersFallback: boolean;
  webglSupported: boolean;
  webglFailed: boolean;
}): GlobeRenderState {
  if (!shouldEnablePublicGlobe3D({ prefersFallback, webglFailed, webglSupported })) {
    return "ready-2d";
  }

  return hasReadyTexture ? "ready-3d" : "checking-webgl";
}

export function resolvePublicGlobeAutoRotate({
  interactionActive,
  reducedMotion,
  webglEnabled,
}: {
  interactionActive: boolean;
  reducedMotion: boolean;
  webglEnabled: boolean;
}) {
  return webglEnabled && !reducedMotion && !interactionActive ? "on" : "off";
}
