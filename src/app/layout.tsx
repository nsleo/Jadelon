import type { Metadata } from "next";

import { SiteShell } from "@/components/site/navigation";
import { SkipLink } from "@/components/site/primitives";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jadelon | Atlas",
    template: "%s | Jadelon",
  },
  description:
    "Jadelon apresenta um mundo registrado por mapas, eras e testemunhos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <SkipLink />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
