import type {
  CartographyPoint,
  ContinentShape,
} from "../../types/cartography.ts";

const coordinateSpace = {
  width: 2048,
  height: 1536,
} as const;

function pointsToSvgPath(points: CartographyPoint[]) {
  return points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
    )
    .concat("Z")
    .join(" ");
}

function createShape(
  input: Omit<ContinentShape, "coordinateSpace" | "sourceAssetId" | "svgPath" | "status">,
): ContinentShape {
  return {
    ...input,
    coordinateSpace,
    sourceAssetId: "mapa-atlas-clean-source-candidate",
    status: "candidate",
    svgPath: input.polygon ? pointsToSvgPath(input.polygon) : undefined,
  };
}

export const candidateContinentShapes: ContinentShape[] = [
  createShape({
    id: "continent-bergskrona",
    name: "Bergskrona",
    slug: "bergskrona",
    confidence: "medium",
    polygon: [
      { x: 82, y: 854 },
      { x: 196, y: 800 },
      { x: 344, y: 816 },
      { x: 430, y: 876 },
      { x: 472, y: 1010 },
      { x: 544, y: 1118 },
      { x: 676, y: 1118 },
      { x: 774, y: 1188 },
      { x: 922, y: 1180 },
      { x: 1012, y: 1220 },
      { x: 1098, y: 1320 },
      { x: 1092, y: 1432 },
      { x: 1004, y: 1506 },
      { x: 872, y: 1510 },
      { x: 752, y: 1478 },
      { x: 620, y: 1508 },
      { x: 484, y: 1482 },
      { x: 338, y: 1484 },
      { x: 240, y: 1444 },
      { x: 148, y: 1452 },
      { x: 74, y: 1390 },
      { x: 40, y: 1288 },
      { x: 54, y: 1150 },
      { x: 26, y: 1030 },
    ],
    islandPolygons: [
      [
        { x: 10, y: 1290 },
        { x: 48, y: 1266 },
        { x: 84, y: 1288 },
        { x: 86, y: 1346 },
        { x: 34, y: 1368 },
      ],
      [
        { x: 350, y: 760 },
        { x: 432, y: 754 },
        { x: 470, y: 818 },
        { x: 426, y: 900 },
        { x: 352, y: 898 },
        { x: 316, y: 828 },
      ],
    ],
  }),
  createShape({
    id: "continent-baaldrum",
    name: "Báaldrum",
    slug: "baaldrum",
    confidence: "medium",
    polygon: [
      { x: 438, y: 682 },
      { x: 554, y: 666 },
      { x: 650, y: 694 },
      { x: 766, y: 684 },
      { x: 862, y: 730 },
      { x: 928, y: 792 },
      { x: 928, y: 920 },
      { x: 880, y: 1008 },
      { x: 924, y: 1100 },
      { x: 860, y: 1180 },
      { x: 760, y: 1200 },
      { x: 670, y: 1168 },
      { x: 562, y: 1172 },
      { x: 488, y: 1112 },
      { x: 444, y: 1040 },
      { x: 404, y: 924 },
      { x: 402, y: 820 },
    ],
    islandPolygons: [
      [
        { x: 844, y: 1128 },
        { x: 922, y: 1086 },
        { x: 988, y: 1148 },
        { x: 958, y: 1232 },
        { x: 894, y: 1250 },
        { x: 838, y: 1198 },
      ],
      [
        { x: 958, y: 1082 },
        { x: 1034, y: 1034 },
        { x: 1082, y: 1088 },
        { x: 1060, y: 1160 },
        { x: 1002, y: 1188 },
        { x: 952, y: 1146 },
      ],
    ],
  }),
  createShape({
    id: "continent-snoklem",
    name: "Snøklem",
    slug: "snoklem",
    confidence: "medium",
    polygon: [
      { x: 118, y: 300 },
      { x: 208, y: 226 },
      { x: 340, y: 226 },
      { x: 458, y: 208 },
      { x: 570, y: 236 },
      { x: 664, y: 218 },
      { x: 760, y: 264 },
      { x: 900, y: 250 },
      { x: 994, y: 306 },
      { x: 1100, y: 292 },
      { x: 1132, y: 398 },
      { x: 1072, y: 522 },
      { x: 978, y: 572 },
      { x: 914, y: 696 },
      { x: 816, y: 742 },
      { x: 736, y: 846 },
      { x: 660, y: 858 },
      { x: 586, y: 806 },
      { x: 526, y: 784 },
      { x: 454, y: 738 },
      { x: 348, y: 752 },
      { x: 248, y: 692 },
      { x: 166, y: 610 },
      { x: 126, y: 506 },
    ],
    islandPolygons: [
      [
        { x: 214, y: 90 },
        { x: 304, y: 54 },
        { x: 420, y: 86 },
        { x: 500, y: 166 },
        { x: 466, y: 246 },
        { x: 332, y: 218 },
        { x: 236, y: 182 },
      ],
      [
        { x: 596, y: 134 },
        { x: 662, y: 132 },
        { x: 700, y: 182 },
        { x: 674, y: 246 },
        { x: 610, y: 242 },
        { x: 574, y: 190 },
      ],
      [
        { x: 92, y: 272 },
        { x: 138, y: 258 },
        { x: 184, y: 284 },
        { x: 176, y: 330 },
        { x: 118, y: 356 },
        { x: 74, y: 324 },
      ],
      [
        { x: 922, y: 280 },
        { x: 968, y: 264 },
        { x: 1008, y: 292 },
        { x: 994, y: 344 },
        { x: 938, y: 356 },
        { x: 902, y: 322 },
      ],
      [
        { x: 1070, y: 416 },
        { x: 1106, y: 398 },
        { x: 1138, y: 428 },
        { x: 1128, y: 480 },
        { x: 1082, y: 488 },
        { x: 1052, y: 452 },
      ],
    ],
  }),
  createShape({
    id: "continent-cathizar",
    name: "Cathizar",
    slug: "cathizar",
    confidence: "medium",
    polygon: [
      { x: 984, y: 84 },
      { x: 1124, y: 74 },
      { x: 1244, y: 24 },
      { x: 1396, y: 24 },
      { x: 1550, y: 50 },
      { x: 1696, y: 42 },
      { x: 1832, y: 80 },
      { x: 1984, y: 60 },
      { x: 2044, y: 128 },
      { x: 2024, y: 246 },
      { x: 1932, y: 332 },
      { x: 1912, y: 432 },
      { x: 2032, y: 440 },
      { x: 2040, y: 552 },
      { x: 1950, y: 626 },
      { x: 1828, y: 592 },
      { x: 1722, y: 640 },
      { x: 1638, y: 604 },
      { x: 1544, y: 626 },
      { x: 1424, y: 606 },
      { x: 1318, y: 646 },
      { x: 1212, y: 612 },
      { x: 1126, y: 582 },
      { x: 1014, y: 506 },
      { x: 984, y: 392 },
      { x: 886, y: 332 },
      { x: 900, y: 250 },
      { x: 952, y: 200 },
    ],
    islandPolygons: [
      [
        { x: 1004, y: 84 },
        { x: 1054, y: 62 },
        { x: 1094, y: 88 },
        { x: 1070, y: 130 },
        { x: 1018, y: 132 },
        { x: 986, y: 108 },
      ],
      [
        { x: 1064, y: 610 },
        { x: 1112, y: 590 },
        { x: 1152, y: 616 },
        { x: 1140, y: 664 },
        { x: 1088, y: 678 },
        { x: 1048, y: 648 },
      ],
    ],
  }),
  createShape({
    id: "continent-neverith",
    name: "Névérith",
    slug: "neverith",
    confidence: "medium",
    polygon: [
      { x: 1136, y: 832 },
      { x: 1248, y: 808 },
      { x: 1378, y: 820 },
      { x: 1486, y: 814 },
      { x: 1566, y: 844 },
      { x: 1658, y: 864 },
      { x: 1674, y: 940 },
      { x: 1602, y: 996 },
      { x: 1490, y: 1022 },
      { x: 1384, y: 1022 },
      { x: 1282, y: 1000 },
      { x: 1198, y: 1020 },
      { x: 1128, y: 974 },
      { x: 1098, y: 900 },
    ],
    islandPolygons: [
      [
        { x: 1048, y: 880 },
        { x: 1086, y: 856 },
        { x: 1124, y: 878 },
        { x: 1120, y: 928 },
        { x: 1072, y: 950 },
        { x: 1032, y: 922 },
      ],
      [
        { x: 1712, y: 782 },
        { x: 1786, y: 774 },
        { x: 1818, y: 842 },
        { x: 1762, y: 888 },
        { x: 1698, y: 852 },
      ],
      [
        { x: 1834, y: 814 },
        { x: 1892, y: 802 },
        { x: 1924, y: 852 },
        { x: 1888, y: 900 },
        { x: 1834, y: 884 },
      ],
      [
        { x: 1950, y: 826 },
        { x: 2004, y: 820 },
        { x: 2026, y: 868 },
        { x: 1992, y: 904 },
        { x: 1944, y: 892 },
      ],
    ],
  }),
  createShape({
    id: "continent-xharas-tor",
    name: "Xharas-Tor",
    slug: "xharas-tor",
    confidence: "low",
    polygon: [
      { x: 1262, y: 1024 },
      { x: 1380, y: 1008 },
      { x: 1508, y: 1008 },
      { x: 1630, y: 1010 },
      { x: 1756, y: 1040 },
      { x: 1902, y: 1022 },
      { x: 2028, y: 1060 },
      { x: 2040, y: 1188 },
      { x: 2000, y: 1286 },
      { x: 2010, y: 1398 },
      { x: 1958, y: 1502 },
      { x: 1822, y: 1512 },
      { x: 1690, y: 1476 },
      { x: 1572, y: 1488 },
      { x: 1436, y: 1446 },
      { x: 1314, y: 1450 },
      { x: 1216, y: 1384 },
      { x: 1182, y: 1268 },
      { x: 1172, y: 1142 },
      { x: 1208, y: 1066 },
    ],
    islandPolygons: [
      [
        { x: 1278, y: 1176 },
        { x: 1354, y: 1166 },
        { x: 1392, y: 1216 },
        { x: 1360, y: 1282 },
        { x: 1296, y: 1274 },
        { x: 1260, y: 1220 },
      ],
      [
        { x: 1488, y: 1118 },
        { x: 1528, y: 1106 },
        { x: 1566, y: 1132 },
        { x: 1558, y: 1176 },
        { x: 1510, y: 1194 },
        { x: 1472, y: 1162 },
      ],
      [
        { x: 1714, y: 1116 },
        { x: 1772, y: 1096 },
        { x: 1810, y: 1136 },
        { x: 1788, y: 1198 },
        { x: 1724, y: 1202 },
        { x: 1690, y: 1160 },
      ],
      [
        { x: 1102, y: 1292 },
        { x: 1146, y: 1264 },
        { x: 1194, y: 1298 },
        { x: 1182, y: 1350 },
        { x: 1128, y: 1368 },
        { x: 1088, y: 1334 },
      ],
    ],
  }),
];

export function getCandidateContinentShape(id: string) {
  return candidateContinentShapes.find((shape) => shape.id === id);
}

export function getShapePolygonSets(shape: ContinentShape) {
  return [shape.polygon ?? [], ...(shape.islandPolygons ?? [])].filter(
    (polygon) => polygon.length >= 3,
  );
}

export function getShapeBounds(shape: ContinentShape) {
  const polygons = getShapePolygonSets(shape);
  const points = polygons.flat();

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}
