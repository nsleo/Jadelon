import type { Metadata } from "next";

import { WikiBrowser } from "@/components/wiki/wiki-browser";
import { SectionFrame, SectionHeading } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Wiki interna",
  description: "Arquivo de validação da lore pública e privada de Jadelon.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WikiPage() {
  return (
    <SectionFrame className="page-shell wiki-page">
      <SectionHeading
        eyebrow="Arquivo interno · revisão de canon"
        level="h1"
        title="Wiki de Jadelon"
        description="Geografia, política, Eternos, magia e registros reunidos em um índice único para validar a lore antes da publicação. Esta rota inclui material privado e não é uma barreira de autenticação."
      />
      <WikiBrowser />
    </SectionFrame>
  );
}
