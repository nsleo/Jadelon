import { JadelonGlobeDynamic } from "@/components/globe/jadelon-globe-dynamic";
import { getPrototypeGlobeDataset } from "@/lib/globe/prototype-points";

export function JadelonGlobeLoader({
  showDiagnostics = false,
}: {
  showDiagnostics?: boolean;
}) {
  const dataset = getPrototypeGlobeDataset();

  return (
    <JadelonGlobeDynamic
      dataset={dataset}
      showDiagnostics={showDiagnostics}
    />
  );
}
