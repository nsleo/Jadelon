import { JadelonGlobeDynamic } from "@/components/globe/jadelon-globe-dynamic";
import { JadelonGlobePublic } from "@/components/globe/jadelon-globe-public";
import type { GlobeMapAsset } from "@/components/globe/types";
import { getPublicAssetById } from "@/lib/content/public-runtime";
import { getGlobeDatasetByAssetId, getPrototypeGlobeDataset } from "@/lib/globe/prototype-points";

export function JadelonGlobeLoader({
  priority = false,
  publicMode = false,
  showDiagnostics = false,
}: {
  priority?: boolean;
  publicMode?: boolean;
  showDiagnostics?: boolean;
}) {
  if (publicMode) {
    const dataset = getGlobeDatasetByAssetId("map-globe-jadelon-v1");
    const fallbackAsset = getPublicAssetById("map-atlas-jadelon-v1");

    if (!fallbackAsset) {
      throw new Error('Public globe requires the "map-atlas-jadelon-v1" asset.');
    }

    const publicFallbackAsset: GlobeMapAsset = {
      alt: fallbackAsset.alt ?? "",
      checksum: fallbackAsset.checksum,
      height: fallbackAsset.height ?? 1536,
      id: fallbackAsset.id,
      publicUrl: fallbackAsset.publicUrl,
      width: fallbackAsset.width ?? 2048,
    };

    return (
      <JadelonGlobePublic
        fallbackAsset={publicFallbackAsset}
        mapAsset={dataset.mapAsset}
        priority={priority}
      />
    );
  }

  const dataset = getPrototypeGlobeDataset();

  return (
    <JadelonGlobeDynamic
      dataset={dataset}
      showDiagnostics={showDiagnostics}
    />
  );
}
