import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/site/placeholder-page";

export const metadata: Metadata = {
  title: "Magia",
};

export default function MagiaPage() {
  return (
    <PlaceholderPage
      eyebrow="Magia"
      title="Magia e Véu"
      description="Fluxos, escolas e arquétipos aparecem aqui como leitura parcial dos estudos preservados."
      note="O Véu permanece descrito apenas nos limites que os registros já permitem."
    />
  );
}
