import type { Metadata } from "next";

import {
  SectionFrame,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Cronologia",
};

export default function CronologiaPage() {
  return (
    <SectionFrame className="page-shell page-shell--narrow">
      <SectionHeading
        eyebrow="Cronologia"
        level="h1"
        title="Cronologia conhecida"
        description="As eras aprovadas reúnem os acontecimentos confirmados e deixam visíveis os intervalos ainda incompletos."
      />
      <ol className="chronology-rail__list">
        <li>
          <span>0-8000</span>
          <p>Primeira Era.</p>
        </li>
        <li>
          <span>6000-8000</span>
          <p>Era Política.</p>
        </li>
        <li>
          <span>6000-6040</span>
          <p>Guerra das Fendas.</p>
        </li>
        <li>
          <span>Registros</span>
          <p>Nem todo período chegou inteiro aos registros.</p>
        </li>
      </ol>
      <TextLink href="/registros">Ver registros preservados</TextLink>
    </SectionFrame>
  );
}
