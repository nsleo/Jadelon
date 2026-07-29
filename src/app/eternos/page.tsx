import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/site/placeholder-page";

export const metadata: Metadata = {
  title: "Eternos",
};

export default function EternosPage() {
  return (
    <PlaceholderPage
      eyebrow="Eternos"
      title="Eternos"
      description="Os registros reunidos nesta rota permanecem contidos e de leitura parcial."
      note="Nem tudo atravessou o tempo com a mesma nitidez, mas a trilha conhecida segue preservada."
    />
  );
}
