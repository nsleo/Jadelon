import {
  baseEntitySchema,
  canonStatusSchema,
} from "../validation/content-schema.ts";
import { getPublicAssetById } from "../assets/public-asset-registry.ts";
import type {
  BaseEntity,
  CanonStatus,
  DiscoverableEntity,
  EntityType,
  PublicEntity,
  PublicIndexEntry,
  RelationType,
  Visibility,
} from "../../types/content.ts";

export type ValidationReport = {
  entityCount: number;
  publicCount: number;
  discoverableCount: number;
  slugCount: number;
  relationCount: number;
};

export const forbiddenPublicCosmologyTerms = [
  "Primeira Fagulha",
  "Originários",
  "Originarios",
  "O Conhecido",
  "O Desconhecido",
  "O Vigia",
  "cosmologia secreta",
  "hierarquia cosmológica",
  "hierarquia cosmologica",
];

const placeEntityTypes = new Set<EntityType>([
  "world",
  "continent",
  "region",
  "kingdom",
  "city",
  "landmark",
]);

const relationTargetTypes: Record<RelationType, Set<EntityType>> = {
  "located-in": placeEntityTypes,
  "part-of": new Set<EntityType>([
    "world",
    "continent",
    "region",
    "kingdom",
    "organization",
    "era",
  ]),
  contains: new Set<EntityType>([
    "continent",
    "region",
    "kingdom",
    "city",
    "landmark",
    "event",
    "era",
    "organization",
    "character",
    "concept",
    "resource",
  ]),
  "occurs-during": new Set<EntityType>(["era"]),
  "occurs-at": new Set<EntityType>([
    "continent",
    "region",
    "kingdom",
    "city",
    "landmark",
  ]),
  "ruled-by": new Set<EntityType>(["character", "deity", "organization"]),
  "founded-by": new Set<EntityType>(["character", "deity", "organization"]),
  "associated-with": new Set<EntityType>([
    "world",
    "continent",
    "region",
    "kingdom",
    "city",
    "landmark",
    "character",
    "deity",
    "event",
    "era",
    "organization",
    "concept",
    "record",
    "resource",
  ]),
  "participated-in": new Set<EntityType>(["event"]),
  opposes: new Set<EntityType>(["character", "deity", "organization"]),
  "member-of": new Set<EntityType>(["organization"]),
  "related-record": new Set<EntityType>(["record"]),
  "uses-resource": new Set<EntityType>(["resource", "concept"]),
};

const relationOriginTypes: Partial<Record<RelationType, Set<EntityType>>> = {
  "occurs-during": new Set<EntityType>(["event", "record"]),
  "occurs-at": new Set<EntityType>(["event", "record"]),
  "participated-in": new Set<EntityType>(["character", "organization", "deity"]),
  "ruled-by": new Set<EntityType>(["kingdom", "city", "organization", "region"]),
  "founded-by": new Set<EntityType>(["kingdom", "city", "organization"]),
  contains: new Set<EntityType>(["world", "continent", "region", "kingdom", "city", "era"]),
  "located-in": new Set<EntityType>(["continent", "region", "kingdom", "city", "landmark", "organization"]),
};

function assertValidVisibility(
  entities: BaseEntity[],
  sourceLabel: string,
  expectedVisibility: Visibility,
) {
  for (const entity of entities) {
    if (entity.visibility !== expectedVisibility) {
      throw new Error(
        `${sourceLabel}: entity "${entity.id}" must use visibility "${expectedVisibility}".`,
      );
    }
  }
}

function assertUnique<T>(values: T[], label: string) {
  const seen = new Set<T>();

  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label} detected: "${String(value)}".`);
    }

    seen.add(value);
  }
}

function assertNoForbiddenPublicTerms(entities: BaseEntity[]) {
  for (const entity of entities) {
    const searchable = [
      entity.name,
      entity.title,
      entity.subtitle,
      entity.summary,
      entity.body,
      ...entity.tags,
    ]
      .filter(Boolean)
      .join(" ");

    for (const term of forbiddenPublicCosmologyTerms) {
      if (searchable.includes(term)) {
        throw new Error(
          `Public entity "${entity.id}" exposes forbidden cosmology term "${term}".`,
        );
      }
    }

    if (/\bIsso\b/.test(searchable)) {
      throw new Error(
        `Public entity "${entity.id}" exposes forbidden cosmology term "Isso".`,
      );
    }
  }
}

function assertRelationSemantics(entities: BaseEntity[]) {
  const entityMap = new Map(entities.map((entity) => [entity.id, entity]));

  for (const entity of entities) {
    if (entity.canonStatus === "conflict" && entity.recordState !== "contested") {
      throw new Error(
        `Entity "${entity.id}" must declare recordState "contested" when canonStatus is "conflict".`,
      );
    }

    for (const relation of entity.relations) {
      if (relation.canonStatus) {
        canonStatusSchema.parse(relation.canonStatus satisfies CanonStatus);
      }

      const target = entityMap.get(relation.targetId);
      if (!target) {
        throw new Error(
          `Entity "${entity.id}" references missing target "${relation.targetId}".`,
        );
      }

      if (
        entity.visibility === "public" &&
        target.visibility !== "public"
      ) {
        throw new Error(
          `Public entity "${entity.id}" cannot point to non-public target "${target.id}".`,
        );
      }

      const allowedTargets = relationTargetTypes[relation.type];
      if (!allowedTargets.has(target.type)) {
        throw new Error(
          `Entity "${entity.id}" uses relation "${relation.type}" with incompatible target "${target.id}" of type "${target.type}".`,
        );
      }

      const allowedOrigins = relationOriginTypes[relation.type];
      if (allowedOrigins && !allowedOrigins.has(entity.type)) {
        throw new Error(
          `Entity "${entity.id}" of type "${entity.type}" cannot use relation "${relation.type}".`,
        );
      }
    }
  }
}

function assertTemporalIntegrity(entities: BaseEntity[]) {
  const entityMap = new Map(entities.map((entity) => [entity.id, entity]));

  for (const entity of entities) {
    const temporal = entity.temporal;
    if (!temporal) continue;

    if (temporal.isUndated && temporal.yearStart !== undefined) {
      throw new Error(`Entity "${entity.id}" cannot combine isUndated with yearStart.`);
    }

    if (temporal.isUndated && temporal.yearEnd !== undefined) {
      throw new Error(`Entity "${entity.id}" cannot combine isUndated with yearEnd.`);
    }

    if (
      temporal.yearStart !== undefined &&
      temporal.yearEnd !== undefined &&
      temporal.yearEnd < temporal.yearStart
    ) {
      throw new Error(`Entity "${entity.id}" has yearEnd smaller than yearStart.`);
    }

    for (const eraId of temporal.eraIds ?? []) {
      const era = entityMap.get(eraId);
      if (!era) {
        throw new Error(`Entity "${entity.id}" references missing era "${eraId}".`);
      }
      if (era.type !== "era") {
        throw new Error(`Entity "${entity.id}" references non-era temporal target "${eraId}".`);
      }
    }
  }
}

function assertGeographyIntegrity(entities: BaseEntity[]) {
  const entityMap = new Map(entities.map((entity) => [entity.id, entity]));

  for (const entity of entities) {
    const geography = entity.geography;
    if (geography?.continentId) {
      const continent = entityMap.get(geography.continentId);
      if (!continent) {
        throw new Error(`Entity "${entity.id}" references missing continent "${geography.continentId}".`);
      }
      if (continent.type !== "continent") {
        throw new Error(`Entity "${entity.id}" references non-continent geography target "${geography.continentId}".`);
      }
    }

    if (geography?.parentPlaceId) {
      const parentPlace = entityMap.get(geography.parentPlaceId);
      if (!parentPlace) {
        throw new Error(`Entity "${entity.id}" references missing parent place "${geography.parentPlaceId}".`);
      }
      if (!placeEntityTypes.has(parentPlace.type)) {
        throw new Error(`Entity "${entity.id}" references non-geographic parent place "${geography.parentPlaceId}".`);
      }
    }

    const technical = entity.technical;
    if (
      technical?.prototypeMapPoint &&
      technical.prototypeMapPoint.precision !== "prototype"
    ) {
      throw new Error(`Entity "${entity.id}" must use prototype precision in technical.prototypeMapPoint.`);
    }

    if (
      technical?.prototypeGlobePoint &&
      technical.prototypeGlobePoint.precision !== "prototype"
    ) {
      throw new Error(`Entity "${entity.id}" must use prototype precision in technical.prototypeGlobePoint.`);
    }
  }
}

function assertMediaIntegrity(entities: BaseEntity[]) {
  for (const entity of entities) {
    for (const media of entity.media) {
      const asset = getPublicAssetById(media.assetId);

      if (!asset) {
        throw new Error(
          `Entity "${entity.id}" references missing public asset "${media.assetId}".`,
        );
      }

      if (asset.publicUrl.includes("docs/") || asset.publicUrl.includes("assets/reference/")) {
        throw new Error(
          `Entity "${entity.id}" references forbidden asset path through "${media.assetId}".`,
        );
      }
    }
  }
}

function assertProjectSpecificConstraints(entities: BaseEntity[]) {
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  const guerra = byId.get("event-guerra-das-fendas");
  const zanHau = byId.get("character-zan-hau");

  if (!guerra) {
    throw new Error('Missing required entity "event-guerra-das-fendas".');
  }

  const occursDuringEraPolitica = guerra.relations.some(
    (relation) =>
      relation.type === "occurs-during" &&
      relation.targetId === "era-politica",
  );

  if (!occursDuringEraPolitica) {
    throw new Error(
      'Entity "event-guerra-das-fendas" must occur during "era-politica".',
    );
  }

  if (!guerra.temporal?.eraIds?.includes("era-politica")) {
    throw new Error(
      'Entity "event-guerra-das-fendas" must list "era-politica" in temporal.eraIds.',
    );
  }

  if (guerra.temporal.yearStart !== 6000 || guerra.temporal.yearEnd !== 6040) {
    throw new Error(
      'Entity "event-guerra-das-fendas" must use the confirmed years 6000–6040.',
    );
  }

  if (guerra.temporal.isUndated) {
    throw new Error(
      'Entity "event-guerra-das-fendas" must not remain undated after the confirmed chronology.',
    );
  }

  if (!zanHau) {
    throw new Error('Missing required entity "character-zan-hau".');
  }

  if (zanHau.canonStatus !== "approved" || zanHau.recordState !== "confirmed") {
    throw new Error(
      'Entity "character-zan-hau" must remain approved/confirmed.',
    );
  }
}

function parseEntities(entities: BaseEntity[]) {
  return entities.map((entity) => baseEntitySchema.parse(entity));
}

function validatePublicStructure(entities: BaseEntity[]) {
  assertValidVisibility(entities, "publicEntities", "public");
  const parsed = parseEntities(entities);
  assertUnique(
    parsed.map((entity) => entity.id),
    "entity id",
  );
  assertUnique(
    parsed.map((entity) => entity.slug),
    "slug",
  );
  assertNoForbiddenPublicTerms(parsed);
  assertTemporalIntegrity(parsed);
  assertGeographyIntegrity(parsed);
  assertMediaIntegrity(parsed);
  return parsed;
}

export function validatePublicDataset(entities: BaseEntity[]) {
  const parsed = validatePublicStructure(entities);
  assertRelationSemantics(parsed);
  assertProjectSpecificConstraints(parsed);
  return parsed;
}

export function validateDiscoverableDataset(entities: BaseEntity[]) {
  assertValidVisibility(entities, "discoverableEntities", "discoverable");
  return parseEntities(entities);
}

export function validateAllDatasets(
  publicDataset: BaseEntity[],
  discoverableDataset: BaseEntity[],
) {
  const parsedPublic = validatePublicStructure(publicDataset);
  const parsedDiscoverable = validateDiscoverableDataset(discoverableDataset);
  const combined = [...parsedPublic, ...parsedDiscoverable];

  assertUnique(
    combined.map((entity) => entity.id),
    "entity id",
  );
  assertUnique(
    combined.map((entity) => entity.slug),
    "slug",
  );
  assertRelationSemantics(combined);
  assertProjectSpecificConstraints(combined);
  assertTemporalIntegrity(combined);
  assertGeographyIntegrity(combined);

  return combined;
}

export function projectPublicEntities(entities: BaseEntity[]): PublicEntity[] {
  return validatePublicDataset(entities).map((entity) => ({
    id: entity.id,
    type: entity.type,
    slug: entity.slug,
    name: entity.name,
    title: entity.title,
    subtitle: entity.subtitle,
    summary: entity.summary,
    recordState: entity.recordState,
    temporal: entity.temporal,
    geography: entity.geography,
    technical: entity.technical,
    media: entity.media.map((media) => ({
      kind: media.kind,
      assetId: media.assetId,
      alt: media.alt,
    })),
    relations: entity.relations.map((relation) => ({
      type: relation.type,
      targetId: relation.targetId,
      label: relation.label,
    })),
    tags: entity.tags,
  }));
}

export function projectDiscoverableEntities(
  entities: BaseEntity[],
): DiscoverableEntity[] {
  return validateDiscoverableDataset(entities).map((entity) => ({
    id: entity.id,
    type: entity.type,
    slug: entity.slug,
    name: entity.name,
    title: entity.title,
    subtitle: entity.subtitle,
    summary: entity.summary,
    recordState: entity.recordState,
    temporal: entity.temporal,
    geography: entity.geography,
    tags: entity.tags,
  }));
}

export function createPublicIndex(entities: PublicEntity[]): PublicIndexEntry[] {
  return entities.map((entity) => ({
    id: entity.id,
    type: entity.type,
    slug: entity.slug,
    name: entity.name,
    title: entity.title,
    summary: entity.summary,
    recordState: entity.recordState,
    tags: entity.tags,
  }));
}

export function buildValidationReport(
  publicDataset: BaseEntity[],
  discoverableDataset: BaseEntity[],
): ValidationReport {
  const allEntities = validateAllDatasets(publicDataset, discoverableDataset);

  return {
    entityCount: allEntities.length,
    publicCount: publicDataset.length,
    discoverableCount: discoverableDataset.length,
    slugCount: new Set(allEntities.map((entity) => entity.slug)).size,
    relationCount: allEntities.reduce(
      (total, entity) => total + entity.relations.length,
      0,
    ),
  };
}
