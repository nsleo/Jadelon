import type { Metadata } from "next";

import { CartographyCalibration } from "@/components/cartography/cartography-calibration";

export const metadata: Metadata = {
  title: "Prototipo de Cartografia",
  description:
    "Rota interna de calibracao cartografica para os candidatos do mapa de Jadelon.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartographyPrototypePage() {
  return <CartographyCalibration />;
}
