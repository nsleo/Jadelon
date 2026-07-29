export type AssetStatus =
  | "reference"
  | "prototype"
  | "approved"
  | "production";

export type AssetKind =
  | "map"
  | "texture"
  | "symbol"
  | "illustration"
  | "ui";

export type PublicAsset = {
  id: string;
  kind: AssetKind;
  status: AssetStatus;
  publicUrl: string;
  width?: number;
  height?: number;
  alt?: string;
};
