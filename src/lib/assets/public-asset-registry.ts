import type { PublicAsset } from "@/types/assets";

export const publicAssetRegistry: PublicAsset[] = [
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
