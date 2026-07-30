import type { Metadata } from "next";

import { HomePage as HomePageContent } from "@/components/home-page";

export const metadata: Metadata = {
  description:
    "Explore Jadelon por um Atlas narrativo com globo, cartografia limpa e registros preservados.",
  title: "Jadelon | Atlas vivo",
};

export default function HomeRoute() {
  return <HomePageContent />;
}
