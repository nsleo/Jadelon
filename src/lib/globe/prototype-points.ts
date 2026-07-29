import type { PublicAsset } from "../../types/assets.ts";
import type { PublicEntity } from "../../types/content.ts";
import type {
  GlobeHotspot,
  GlobeMapAsset,
  PrototypeGlobeDataset,
} from "../../components/globe/types.ts";
import {
  getPublicAssetById,
  getPublicEntityById,
} from "../content/public-runtime.ts";

export const prototypeGlobeRadius = 1;

export const prototypeGlobeCamera = {
  fov: 52,
  near: 0.1,
  far: 14,
  distance: 4.5,
  minDistance: 3.35,
  maxDistance: 6.4,
  minPolarAngle: 0.55,
  maxPolarAngle: 2.58,
} as const;

const prototypeContinentIds = [
  "continent-bergskrona",
  "continent-baaldrum",
  "continent-snoklem",
  "continent-cathizar",
  "continent-neverith",
  "continent-xharas-tor",
] as const;

function projectMapAsset(asset: PublicAsset): GlobeMapAsset {
  if (!asset.width || !asset.height) {
    throw new Error(`Public asset "${asset.id}" is missing width or height.`);
  }

  const extendedAsset = asset as PublicAsset & Partial<
    Pick<GlobeMapAsset, "checksum" | "projectionKey" | "latitudeBand" | "sourceAssetId">
  >;

  return {
    id: asset.id,
    publicUrl: asset.publicUrl,
    width: asset.width,
    height: asset.height,
    alt: asset.alt ?? "",
    checksum: extendedAsset.checksum,
    projectionKey: extendedAsset.projectionKey,
    latitudeBand: extendedAsset.latitudeBand,
    sourceAssetId: extendedAsset.sourceAssetId,
  };
}

export function createPrototypeGlobeDataset(
  mapAsset: GlobeMapAsset,
): PrototypeGlobeDataset {
  return {
    mapAsset,
    hotspots: prototypeContinentIds.map((id) => projectHotspot(requirePrototypeEntity(id))),
  };
}

function requirePrototypeEntity(id: (typeof prototypeContinentIds)[number]) {
  const entity = getPublicEntityById(id);

  if (!entity) {
    throw new Error(`Prototype globe requires public entity "${id}".`);
  }

  return entity;
}

function projectHotspot(entity: PublicEntity): GlobeHotspot {
  const point = entity.technical?.prototypeGlobePoint;

  if (!point) {
    throw new Error(`Entity "${entity.id}" is missing technical.prototypeGlobePoint.`);
  }

  return {
    id: entity.id,
    slug: entity.slug,
    name: entity.name,
    title: entity.title ?? entity.name,
    summary: entity.summary,
    latitude: point.latitude,
    longitude: point.longitude,
    mapX: (point.longitude + 180) / 360,
    mapY: (90 - point.latitude) / 180,
  };
}

export function getPrototypeGlobeDataset(): PrototypeGlobeDataset {
  const mapAsset = getPublicAssetById("map-globe-prototype");

  if (!mapAsset) {
    throw new Error('Prototype globe requires the "map-globe-prototype" asset.');
  }

  return createPrototypeGlobeDataset(projectMapAsset(mapAsset));
}

export function latLonToVector3(
  latitude: number,
  longitude: number,
  radius: number,
) {
  const phi = ((90 - latitude) * Math.PI) / 180;
  const theta = ((longitude + 180) * Math.PI) / 180;
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z] as const;
}

export function getOrbitAnglesForHotspot(
  latitude: number,
  longitude: number,
) {
  const [x, y, z] = latLonToVector3(latitude, longitude, 1);

  return {
    polarAngle: Math.acos(y),
    azimuthalAngle: Math.atan2(x, z),
  };
}

export function isHotspotFacingCamera(
  hotspotPosition: readonly [number, number, number],
  cameraPosition: readonly [number, number, number],
) {
  const hotspotLength = Math.hypot(...hotspotPosition);
  const cameraLength = Math.hypot(...cameraPosition);

  if (hotspotLength === 0 || cameraLength === 0) {
    return false;
  }

  const hotspotNormal = hotspotPosition.map((value) => value / hotspotLength) as [
    number,
    number,
    number,
  ];
  const cameraNormal = cameraPosition.map((value) => value / cameraLength) as [
    number,
    number,
    number,
  ];

  return (
    hotspotNormal[0] * cameraNormal[0] +
      hotspotNormal[1] * cameraNormal[1] +
      hotspotNormal[2] * cameraNormal[2] >
    0
  );
}
