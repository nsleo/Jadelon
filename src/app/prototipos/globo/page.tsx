import type { Metadata } from "next";

import { JadelonGlobeLoader } from "@/components/globe/jadelon-globe-loader";
import {
  AtlasLabel,
  SectionFrame,
  SectionHeading,
} from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Prototipo do Globo",
  description:
    "Rota interna de validacao do subsistema isolado do globo de Jadelon.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GlobePrototypePage() {
  return (
    <div className="globe-prototype-page">
      <SectionFrame className="globe-prototype-page__hero">
        <div>
          <AtlasLabel>Rota interna</AtlasLabel>
          <SectionHeading
            description="Laboratorio do globo 3D com textura provisoria, estados observaveis e fallback 2D preservado."
            title="Globo de Jadelon"
          />
        </div>
      </SectionFrame>

      <JadelonGlobeLoader showDiagnostics />

      <SectionFrame className="globe-prototype-page__ledger">
        <article className="globe-panel">
          <p className="globe-panel__eyebrow">Notas do prototipo</p>
          <ul className="globe-ledger">
            <li>A textura atual deriva do mapa oficial preservado em `assets/reference/`.</li>
            <li>A face posterior e os polos continuam provisórios nesta etapa.</li>
            <li>Os seis hotspots usam apenas `technical.prototypeGlobePoint`.</li>
          </ul>
        </article>

        <article className="globe-panel">
          <p className="globe-panel__eyebrow">Escopo validado</p>
          <ul className="globe-ledger">
            <li>Textura esferica provisoria derivada do mapa oficial atual.</li>
            <li>Interacao por arraste, rolagem, toque e selecao de hotspots.</li>
            <li>Fallback 2D acessivel com os mesmos seis continentes.</li>
            <li>Carregamento client-only do subsistema 3D.</li>
          </ul>
        </article>

        <article className="globe-panel">
          <p className="globe-panel__eyebrow">Fora deste prompt</p>
          <ul className="globe-ledger">
            <li>Integracao definitiva na home.</li>
            <li>Textura limpa de producao e mascaras finais.</li>
            <li>Atlas 2D interativo, cronologia interativa e Helix.</li>
            <li>Pos-processamento pesado ou efeitos anomalos.</li>
          </ul>
        </article>
      </SectionFrame>
    </div>
  );
}
