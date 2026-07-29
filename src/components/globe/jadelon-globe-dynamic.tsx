"use client";

import dynamic from "next/dynamic";

import type { PrototypeGlobeDataset } from "@/components/globe/types";

const JadelonGlobeClient = dynamic(
  () =>
    import("./jadelon-globe.client").then((module) => module.JadelonGlobeClient),
  {
    ssr: false,
  },
);

export function JadelonGlobeDynamic({
  dataset,
  instanceId,
  showDiagnostics = false,
}: {
  dataset: PrototypeGlobeDataset;
  instanceId?: string;
  showDiagnostics?: boolean;
}) {
  return (
    <JadelonGlobeClient
      dataset={dataset}
      instanceId={instanceId}
      showDiagnostics={showDiagnostics}
    />
  );
}
