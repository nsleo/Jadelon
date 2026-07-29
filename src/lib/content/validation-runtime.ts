import { discoverableEntities } from "../../content/discoverable/entities.ts";
import { publicEntities } from "../../content/public/entities.ts";
import {
  buildValidationReport,
  createPublicIndex,
  projectDiscoverableEntities,
  projectPublicEntities,
  validateAllDatasets,
} from "./shared-validation.ts";

export const allValidatedEntities = validateAllDatasets(
  publicEntities,
  discoverableEntities,
);

export const validationPublicProjection = projectPublicEntities(publicEntities);
export const validationDiscoverableProjection = projectDiscoverableEntities(
  discoverableEntities,
);
export const validationPublicIndex = createPublicIndex(validationPublicProjection);

export function getValidationEntityById(id: string) {
  return allValidatedEntities.find((entity) => entity.id === id);
}

export function getValidationReport() {
  return buildValidationReport(publicEntities, discoverableEntities);
}
