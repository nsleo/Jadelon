import { z } from "zod";

export const canonStatusSchema = z.enum([
  "approved",
  "source-recorded",
  "editorial-interpretation",
  "provisional",
  "conflict",
  "secret",
  "excluded-v1",
]);

export const visibilitySchema = z.enum([
  "public",
  "discoverable",
  "restricted",
  "hidden",
  "internal",
]);

export const recordStateSchema = z.enum([
  "confirmed",
  "reported",
  "incomplete",
  "contested",
  "restricted",
  "anomalous",
]);

export const entityTypeSchema = z.enum([
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
]);

export const relationTypeSchema = z.enum([
  "located-in",
  "part-of",
  "contains",
  "occurs-during",
  "occurs-at",
  "ruled-by",
  "founded-by",
  "associated-with",
  "participated-in",
  "opposes",
  "member-of",
  "related-record",
  "uses-resource",
]);

export const temporalPositionSchema = z.object({
  eraIds: z.array(z.string().min(1)).optional(),
  yearStart: z.number().int().optional(),
  yearEnd: z.number().int().optional(),
  isUndated: z.boolean().optional(),
  temporalNote: z.string().min(1).optional(),
});

export const mapPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  precision: z.enum(["exact", "approximate", "prototype"]),
});

export const globePointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  precision: z.enum(["exact", "approximate", "prototype"]),
});

export const geographySchema = z.object({
  continentId: z.string().min(1).optional(),
  parentPlaceId: z.string().min(1).optional(),
  mapPoint: mapPointSchema.optional(),
  globePoint: globePointSchema.optional(),
});

export const technicalPositionSchema = z.object({
  prototypeMapPoint: mapPointSchema.optional(),
  prototypeGlobePoint: globePointSchema.optional(),
});

export const entityRelationSchema = z.object({
  type: relationTypeSchema,
  targetId: z.string().min(1),
  label: z.string().min(1).optional(),
  canonStatus: canonStatusSchema.optional(),
});

export const entityMediaSchema = z.object({
  kind: z.enum(["image", "map", "document"]),
  assetId: z.string().min(1),
  alt: z.string().min(1),
});

export const documentarySourceSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["editorial", "reference", "historical"]),
  label: z.string().min(1),
  authority: z.enum(["active-docs", "reference-docs", "historical-archive"]),
  note: z.string().min(1).optional(),
});

export const baseEntitySchema = z.object({
  id: z.string().min(1),
  type: entityTypeSchema,
  slug: z.string().min(1),
  name: z.string().min(1),
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  summary: z.string().min(1),
  body: z.string().min(1).optional(),
  canonStatus: canonStatusSchema,
  visibility: visibilitySchema,
  recordState: recordStateSchema,
  temporal: temporalPositionSchema.optional(),
  geography: geographySchema.optional(),
  technical: technicalPositionSchema.optional(),
  relations: z.array(entityRelationSchema),
  media: z.array(entityMediaSchema),
  sources: z.array(documentarySourceSchema).min(1),
  tags: z.array(z.string().min(1)),
});

export type BaseEntityInput = z.infer<typeof baseEntitySchema>;
