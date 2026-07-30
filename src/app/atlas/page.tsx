import type { Metadata } from "next";

import { CartographicImage } from "@/components/site/cartographic-image";
import {
  AtlasLabel,
  CoordinateLabel,
  SectionFrame,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { getPublicAssetById } from "@/lib/content/public-runtime";

export const metadata: Metadata = {
  title: "Atlas",
};

export default function AtlasPage() {
  const mapAsset = getPublicAssetById("map-atlas-jadelon-v1");

  if (!mapAsset) {
    throw new Error("Atlas page requires the promoted atlas asset.");
  }

  return (
    <SectionFrame className="page-shell">
      <SectionHeading
        eyebrow="Atlas"
        level="h1"
        title="Geografia conhecida"
        description="Continentes, reinos e marcos surgem aqui como leitura cartográfica do mundo conhecido."
      />
      <div className="atlas-window">
        <div className="atlas-window__map">
          <CartographicImage
            alt={mapAsset.alt ?? ""}
            className="atlas-window__image"
            priority
            sizes="100vw"
            src={mapAsset.publicUrl}
          />
          <div aria-hidden="true" className="atlas-window__wash" />
        </div>
        <div className="atlas-window__footer">
          <CoordinateLabel>Continentes disponíveis: Báaldrum · Snøklem</CoordinateLabel>
          <TextLink href="/cronologia">Percorra a Cronologia</TextLink>
        </div>
      </div>
      <div className="placeholder-shell">
        <p className="placeholder-shell__note">
          Certos trechos permanecem incompletos, mas o mapa já conserva seus principais registros.
        </p>
        <div className="placeholder-shell__list">
          <span className="atlas-page__chip"><AtlasLabel>Báaldrum</AtlasLabel></span>
          <span className="atlas-page__chip"><AtlasLabel>Snøklem</AtlasLabel></span>
          <span className="atlas-page__chip"><AtlasLabel>Brannslott</AtlasLabel></span>
        </div>
      </div>
    </SectionFrame>
  );
}
