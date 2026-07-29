export type CanonStatus =
  | "approved"
  | "source-recorded"
  | "editorial-interpretation"
  | "provisional"
  | "conflict"
  | "secret"
  | "excluded-v1";

export type Visibility =
  | "public"
  | "discoverable"
  | "restricted"
  | "hidden"
  | "internal";

export type RecordState =
  | "confirmed"
  | "reported"
  | "incomplete"
  | "contested"
  | "restricted"
  | "anomalous";

export type EntityType =
  | "world"
  | "continent"
  | "region"
  | "kingdom"
  | "city"
  | "landmark"
  | "character"
  | "deity"
  | "event"
  | "era"
  | "organization"
  | "concept"
  | "record"
  | "resource";

export type RelationType =
  | "located-in"
  | "part-of"
  | "contains"
  | "occurs-during"
  | "occurs-at"
  | "ruled-by"
  | "founded-by"
  | "associated-with"
  | "participated-in"
  | "opposes"
  | "member-of"
  | "related-record"
  | "uses-resource";

export type TemporalPosition = {
  eraIds?: string[];
  yearStart?: number;
  yearEnd?: number;
  isUndated?: boolean;
  temporalNote?: string;
};

export type MapPoint = {
  x: number;
  y: number;
  precision: "exact" | "approximate" | "prototype";
};

export type GlobePoint = {
  latitude: number;
  longitude: number;
  precision: "exact" | "approximate" | "prototype";
};

export type Geography = {
  continentId?: string;
  parentPlaceId?: string;
  mapPoint?: MapPoint;
  globePoint?: GlobePoint;
};

export type TechnicalPosition = {
  prototypeMapPoint?: MapPoint;
  prototypeGlobePoint?: GlobePoint;
};

export type EntityRelation = {
  type: RelationType;
  targetId: string;
  label?: string;
  canonStatus?: CanonStatus;
};

export type EntityMedia = {
  kind: "image" | "map" | "document";
  assetId: string;
  alt: string;
};

export type DocumentarySource = {
  id: string;
  kind: "editorial" | "reference" | "historical";
  label: string;
  authority: "active-docs" | "reference-docs" | "historical-archive";
  note?: string;
};

export type BaseEntity = {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  title?: string;
  subtitle?: string;
  summary: string;
  body?: string;
  canonStatus: CanonStatus;
  visibility: Visibility;
  recordState: RecordState;
  temporal?: TemporalPosition;
  geography?: Geography;
  technical?: TechnicalPosition;
  relations: EntityRelation[];
  media: EntityMedia[];
  sources: DocumentarySource[];
  tags: string[];
};

export type PublicEntityRelation = Pick<EntityRelation, "type" | "targetId" | "label">;

export type PublicEntity = Pick<
  BaseEntity,
  | "id"
  | "type"
  | "slug"
  | "name"
  | "title"
  | "subtitle"
  | "summary"
  | "recordState"
  | "temporal"
  | "geography"
  | "technical"
  | "tags"
> & {
  media: EntityMedia[];
  relations: PublicEntityRelation[];
};

export type DiscoverableEntity = Pick<
  BaseEntity,
  | "id"
  | "type"
  | "slug"
  | "name"
  | "title"
  | "subtitle"
  | "summary"
  | "recordState"
  | "temporal"
  | "geography"
  | "tags"
>;

export type PublicIndexEntry = Pick<
  PublicEntity,
  "id" | "type" | "slug" | "name" | "title" | "summary" | "recordState" | "tags"
>;
