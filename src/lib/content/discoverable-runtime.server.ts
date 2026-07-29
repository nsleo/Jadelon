import "server-only";

import { discoverableEntities } from "../../content/discoverable/entities.ts";
import { projectDiscoverableEntities } from "./shared-validation.ts";

const projectedDiscoverableEntities = projectDiscoverableEntities(
  discoverableEntities,
);
const discoverableEntityById = new Map(
  projectedDiscoverableEntities.map((entity) => [entity.id, entity]),
);

export function getDiscoverableEntityById(id: string) {
  return discoverableEntityById.get(id);
}
