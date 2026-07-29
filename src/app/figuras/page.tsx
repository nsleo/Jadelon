import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/site/placeholder-page";

export const metadata: Metadata = {
  title: "Figuras",
};

export default function FigurasPage() {
  return (
    <PlaceholderPage
      eyebrow="Figuras"
      title="Figuras registradas"
      description="Os nomes preservados surgem aqui como passagem para testemunhos e acontecimentos associados."
      note="Alguns perfis permanecem incompletos, mas os registros conhecidos já podem ser consultados."
    />
  );
}
