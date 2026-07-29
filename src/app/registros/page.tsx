import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/site/placeholder-page";

export const metadata: Metadata = {
  title: "Registros",
};

export default function RegistrosPage() {
  return (
    <PlaceholderPage
      eyebrow="Registros"
      title="Registros preservados"
      description="Guerras, figuras e territórios surgem aqui como pontos de entrada para o mapa conhecido."
      note="Certos fragmentos permanecem incompletos, mas os testemunhos principais já podem ser lidos."
    />
  );
}
