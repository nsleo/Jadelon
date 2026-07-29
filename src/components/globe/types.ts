export type GlobeMode = "3d" | "2d";

export type GlobeQualityKey = "low" | "medium" | "high";

export type GlobeRenderState =
  | "idle"
  | "checking-webgl"
  | "loading-texture"
  | "applying-texture"
  | "initializing"
  | "ready-3d"
  | "ready-2d"
  | "error";

export type TextureSwapState =
  | "idle"
  | "requested"
  | "loading-texture"
  | "applying-texture"
  | "ready-3d"
  | "error";

export type GlobeMaterialMode = "basic" | "lit";

export type GlobeSceneCommand =
  | {
      type: "none";
      nonce: number;
    }
  | {
      type: "focus-hotspot";
      nonce: number;
      hotspotId: string;
      instant?: boolean;
    }
  | {
      type: "rotate-quarter";
      nonce: number;
    }
  | {
      type: "set-view-preset";
      nonce: number;
      preset: "front" | "north" | "south" | "left" | "right" | "back";
      instant?: boolean;
    };

export type GlobeHotspot = {
  id: string;
  slug: string;
  name: string;
  title: string;
  summary: string;
  latitude: number;
  longitude: number;
  mapX: number;
  mapY: number;
};

export type GlobeMapAsset = {
  id: string;
  publicUrl: string;
  width: number;
  height: number;
  alt: string;
  checksum?: string;
  projectionKey?: string;
  latitudeBand?: number;
  sourceAssetId?: string;
};

export type PrototypeGlobeDataset = {
  mapAsset: GlobeMapAsset;
  hotspots: GlobeHotspot[];
};

export type GlobeQualityProfile = {
  key: GlobeQualityKey;
  label: string;
  dpr: number;
  segments: number;
  anisotropy: number;
  antialias: boolean;
  autoRotateSpeed: number;
};

export type GlobeTelemetry = {
  azimuthalAngle: number;
  polarAngle: number;
  distance: number;
  canvasWidth: number;
  canvasHeight: number;
  dpr: number;
};

export type GlobeRendererInfo = {
  renderer: string;
  maxTextureSize: number | null;
  antialias: boolean;
};

export type GlobeTextureReadyPayload = {
  textureId: string;
  textureUrl: string;
  resolvedTextureUrl: string;
  checksum?: string;
};
