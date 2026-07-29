export type LabelRetouchRegion = {
  id: string;
  displayName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  padding: number;
  backgroundType:
    | "snow"
    | "dark-land"
    | "green-land"
    | "parchment-land"
    | "island-land"
    | "coastal-dark-land";
  nearbyRisk: string[];
};

export const manualRetouchRegions: LabelRetouchRegion[] = [
  {
    id: "snoklem",
    displayName: "Snøklem",
    x: 243,
    y: 318,
    width: 450,
    height: 118,
    padding: 84,
    backgroundType: "snow",
    nearbyRisk: ["snow-texture", "south-mountains", "east-coastline", "purple-residue"],
  },
  {
    id: "baaldrum",
    displayName: "Báaldrum",
    x: 302,
    y: 735,
    width: 558,
    height: 138,
    padding: 96,
    backgroundType: "coastal-dark-land",
    nearbyRisk: ["mountain-chain", "south-coastline", "dark-terrain-transition", "horizontal-band"],
  },
  {
    id: "bergskrona",
    displayName: "Bergskrona",
    x: 238,
    y: 1269,
    width: 673,
    height: 132,
    padding: 102,
    backgroundType: "green-land",
    nearbyRisk: ["green-relief", "mountain-highlights", "south-peninsula", "terrain-variation"],
  },
  {
    id: "cathizar",
    displayName: "Cathizar",
    x: 1443,
    y: 166,
    width: 430,
    height: 104,
    padding: 92,
    backgroundType: "parchment-land",
    nearbyRisk: ["parchment-grain", "northern-coastline", "yellow-glow", "uniform-block"],
  },
  {
    id: "neverith",
    displayName: "Névérith",
    x: 1380,
    y: 738,
    width: 436,
    height: 110,
    padding: 92,
    backgroundType: "island-land",
    nearbyRisk: ["thin-island-chain", "north-islets", "mainland-edge", "cyan-residue"],
  },
  {
    id: "xharas-tor",
    displayName: "Xharas-Tor",
    x: 1544,
    y: 1269,
    width: 434,
    height: 116,
    padding: 96,
    backgroundType: "dark-land",
    nearbyRisk: ["coastal-channels", "small-nearby-masses", "white-glow", "southern-bays"],
  },
];

export const manualRetouchCanvas = {
  width: 2048,
  height: 1536,
} as const;
