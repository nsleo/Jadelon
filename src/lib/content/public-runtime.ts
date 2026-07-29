import { publicEntities } from "../../content/public/entities.ts";
import {
  createPublicIndex,
  projectPublicEntities,
} from "./shared-validation.ts";
import {
  getPublicAssetById,
  publicAssetRegistry,
} from "../assets/public-asset-registry.ts";

const projectedPublicEntities = projectPublicEntities(publicEntities);
const publicEntityById = new Map(
  projectedPublicEntities.map((entity) => [entity.id, entity]),
);
const publicEntityBySlug = new Map(
  projectedPublicEntities.map((entity) => [entity.slug, entity]),
);

export const publicIndex = createPublicIndex(projectedPublicEntities);
export const publicEntitiesProjection = projectedPublicEntities;
export const publicAssets = publicAssetRegistry;

export function getPublicEntityById(id: string) {
  return publicEntityById.get(id);
}

export function getPublicEntityBySlug(slug: string) {
  return publicEntityBySlug.get(slug);
}

export { getPublicAssetById };
