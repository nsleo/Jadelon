import type { CSSProperties } from "react";

import { CartographicImage } from "@/components/site/cartographic-image";
import type { PublicAsset } from "@/types/assets";

type JadelonAtlasHeroProps = {
  asset: PublicAsset;
  priority?: boolean;
};

const atlasMarkers = [
  { id: "snoklem", label: "Snøklem", x: "20%", y: "23%" },
  { id: "baaldrum", label: "Báaldrum", x: "37%", y: "49%" },
  { id: "bergskrona", label: "Bergskrona", x: "20%", y: "77%" },
  { id: "neverith", label: "Névérith", x: "57%", y: "42%" },
  { id: "cathizar", label: "Cathizar", x: "72%", y: "19%" },
  { id: "xharas-tor", label: "Xharas-Tor", x: "78%", y: "69%" },
];

export function JadelonAtlasHero({ asset, priority = false }: JadelonAtlasHeroProps) {
  return (
    <section
      aria-label="Mapa principal de Jadelon"
      className="atlas-hero-map"
      data-asset-id={asset.id}
      data-asset-url={asset.publicUrl}
      data-testid="public-atlas-hero"
    >
      <CartographicImage
        alt={asset.alt ?? "Mapa limpo oficial de Jadelon."}
        className="atlas-hero-map__image"
        priority={priority}
        sizes="100vw"
        src={asset.publicUrl}
      />
      <div aria-hidden="true" className="atlas-hero-map__wash" />
      <div aria-hidden="true" className="atlas-hero-map__grid" />
      <div aria-hidden="true" className="atlas-hero-map__route atlas-hero-map__route--north" />
      <div aria-hidden="true" className="atlas-hero-map__route atlas-hero-map__route--south" />
      <ul aria-label="Continentes principais de Jadelon" className="atlas-hero-map__markers">
        {atlasMarkers.map((marker) => (
          <li
            className="atlas-hero-map__marker"
            key={marker.id}
            style={{ "--marker-x": marker.x, "--marker-y": marker.y } as CSSProperties}
          >
            <span>{marker.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
