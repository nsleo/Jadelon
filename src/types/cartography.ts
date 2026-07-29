export type CartographyPoint = {
  x: number;
  y: number;
};

export type ContinentShape = {
  id: string;
  name: string;
  slug: string;
  sourceAssetId: string;
  coordinateSpace: {
    width: number;
    height: number;
  };
  polygon?: CartographyPoint[];
  islandPolygons?: CartographyPoint[][];
  svgPath?: string;
  confidence: "low" | "medium" | "high";
  status: "candidate" | "approved";
};

export type CartographyCandidateAsset = {
  id: string;
  kind: "map" | "texture" | "mask" | "overlay";
  status: "candidate" | "approved";
  publicUrl?: string;
  relativePath: string;
  sourceAssetId?: string;
  checksum?: string;
  projectionKey?: string;
  latitudeBand?: number;
  width?: number;
  height?: number;
  alt?: string;
};
