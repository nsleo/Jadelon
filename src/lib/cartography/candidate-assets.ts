import type { CartographyCandidateAsset } from "../../types/cartography.ts";

export const supersededCartographyAssetIds = [
  "mapa-base-sem-labels-candidate",
  "mapa-atlas-2d-candidate",
  "mapa-globo-equirectangular-a",
  "mapa-globo-equirectangular-b",
] as const;

export const cartographyCandidateAssets: CartographyCandidateAsset[] = [
  {
    id: "mapa-atlas-clean-source-candidate",
    kind: "map",
    status: "candidate",
    relativePath: "assets/derived/cartography/candidates/mapa-atlas-clean-source-candidate.png",
    publicUrl: "/assets/jadelon/maps/candidates/mapa-atlas-clean-source-candidate.webp",
    sourceAssetId: "mapa-mundi-original-sem-labels",
    checksum: "8760144b11a3d01375786ac22128a8cb",
    width: 2048,
    height: 1536,
    alt: "Mapa 2D candidato derivado diretamente da fonte limpa oficial de Jadelon.",
  },
  {
    id: "mapa-globo-projection-p55",
    kind: "texture",
    status: "candidate",
    relativePath: "assets/derived/cartography/candidates/mapa-globo-projection-p55.png",
    publicUrl: "/assets/jadelon/maps/candidates/mapa-globo-projection-p55.webp",
    sourceAssetId: "mapa-mundi-original-sem-labels",
    checksum: "4d706a9d61adb1bbcba882fe84aaceb1",
    projectionKey: "p55",
    latitudeBand: 55,
    width: 4096,
    height: 2048,
    alt: "Textura equiretangular candidata P55 com faixa segura mais conservadora.",
  },
  {
    id: "mapa-globo-projection-p60",
    kind: "texture",
    status: "candidate",
    relativePath: "assets/derived/cartography/candidates/mapa-globo-projection-p60.png",
    publicUrl: "/assets/jadelon/maps/candidates/mapa-globo-projection-p60.webp",
    sourceAssetId: "mapa-mundi-original-sem-labels",
    checksum: "26df3428b8bf1b1ebcd8251b687b6e5a",
    projectionKey: "p60",
    latitudeBand: 60,
    width: 4096,
    height: 2048,
    alt: "Textura equiretangular candidata P60 com equilibrio entre presenca e seguranca polar.",
  },
  {
    id: "mapa-globo-projection-p65",
    kind: "texture",
    status: "candidate",
    relativePath: "assets/derived/cartography/candidates/mapa-globo-projection-p65.png",
    publicUrl: "/assets/jadelon/maps/candidates/mapa-globo-projection-p65.webp",
    sourceAssetId: "mapa-mundi-original-sem-labels",
    checksum: "61ee4cd620dbb255be86d7bccd9d4e1c",
    projectionKey: "p65",
    latitudeBand: 65,
    width: 4096,
    height: 2048,
    alt: "Textura equiretangular candidata P65 com maior presenca e maior risco polar.",
  },
  {
    id: "overlay-semantic-clean-source-candidate",
    kind: "overlay",
    status: "candidate",
    relativePath: "assets/derived/cartography/candidates/overlay-semantic-clean-source-candidate.json",
    sourceAssetId: "mapa-atlas-clean-source-candidate",
    checksum: "6d1e8f2989eab669142d80b00d460372",
  },
];

export function getCartographyCandidateAsset(id: string) {
  return cartographyCandidateAssets.find((asset) => asset.id === id);
}
