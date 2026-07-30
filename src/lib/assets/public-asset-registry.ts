import type { PublicAsset } from "@/types/assets";

export const publicAssetRegistry: PublicAsset[] = [
  {
    id: "map-atlas-jadelon-v1",
    kind: "map",
    status: "production",
    publicUrl: "/assets/jadelon/maps/mapa-atlas-jadelon-v1.webp",
    width: 2048,
    height: 1536,
    alt: "Mapa limpo oficial de Jadelon usado como leitura cartografica publica do Atlas.",
    checksum: "4480122866e5740dba8bf95f0926e81b",
    promotedAt: "2026-07-29",
    sourceAssetId: "mapa-atlas-clean-source-candidate",
    technicalDecision:
      "Derivado 2D oficial promovido a partir da fonte limpa validada, sem alterar o canone geografico.",
  },
  {
    id: "map-globe-jadelon-v1",
    kind: "texture",
    status: "production",
    publicUrl: "/assets/jadelon/maps/mapa-globo-jadelon-v1.webp",
    width: 4096,
    height: 2048,
    alt: "Textura oficial do globo publico de Jadelon, promovida a partir da projecao tecnica P60.",
    checksum: "1af08e5b9e9c33435e8659b53a83ff92",
    fallbackAssetId: "map-atlas-jadelon-v1",
    latitudeBand: 60,
    projectionKey: "p60",
    promotedAt: "2026-07-29",
    sourceAssetId: "mapa-globo-projection-p60",
    technicalDecision:
      "Projecao tecnica P60 promovida para o runtime publico; nao representa latitude canonica nem geografia canonica.",
  },
  {
    id: "overlay-semantic-jadelon-v1",
    kind: "map",
    status: "production",
    publicUrl: "/assets/jadelon/maps/overlay-semantic-jadelon-v1.json",
    width: 2048,
    height: 1536,
    checksum: "6d1e8f2989eab669142d80b00d460372",
    promotedAt: "2026-07-29",
    sourceAssetId: "overlay-semantic-clean-source-candidate",
    technicalDecision:
      "Overlay semantico promovido em coordinate space do atlas limpo oficial.",
  },
  {
    id: "map-shell-background",
    kind: "map",
    status: "prototype",
    publicUrl: "/assets/jadelon/maps/prototype/jadelon-shell-map-background.webp",
    width: 2048,
    height: 1536,
    alt: "Derivado cartografico de prototipo do mapa de Jadelon para fundo editorial.",
  },
  {
    id: "map-shell-low",
    kind: "map",
    status: "prototype",
    publicUrl: "/assets/jadelon/maps/prototype/jadelon-shell-map-low.webp",
    width: 1280,
    height: 960,
    alt: "Derivado cartografico de baixa resolucao para composicoes provisoriais do shell.",
  },
  {
    id: "map-shell-initial",
    kind: "map",
    status: "prototype",
    publicUrl: "/assets/jadelon/maps/prototype/jadelon-shell-map-initial.webp",
    width: 960,
    height: 720,
    alt: "Derivado cartografico comprimido para carregamento inicial do shell.",
  },
  {
    id: "map-shell-thumbnail",
    kind: "map",
    status: "prototype",
    publicUrl: "/assets/jadelon/maps/prototype/jadelon-shell-map-thumbnail.webp",
    width: 640,
    height: 480,
    alt: "Miniatura cartografica de prototipo do mapa de Jadelon.",
  },
  {
    id: "map-globe-prototype",
    kind: "map",
    status: "prototype",
    publicUrl: "/assets/jadelon/maps/prototype/mapa-globo-prototype.webp",
    width: 2048,
    height: 1024,
    alt: "Textura esferica provisoria do globo de Jadelon, derivada do mapa oficial atual.",
  },
];

const publicAssetsById = new Map(
  publicAssetRegistry.map((asset) => [asset.id, asset]),
);

export function getPublicAssetById(id: string) {
  return publicAssetsById.get(id);
}
