import type { GlobeHotspot, PrototypeGlobeDataset } from "@/components/globe/types";

type GlobeFallbackProps = {
  dataset: PrototypeGlobeDataset;
  activeHotspotId?: string;
  onSelectHotspot?: (hotspotId: string) => void;
  onImageLoad?: () => void;
  onImageError?: () => void;
  warning?: string;
};

function GlobeFallbackDetails({
  hotspot,
}: {
  hotspot: GlobeHotspot;
}) {
  return (
    <article className="globe-fallback__details">
      <h3>{hotspot.title}</h3>
      <p>{hotspot.summary}</p>
    </article>
  );
}

export function GlobeFallback({
  dataset,
  activeHotspotId,
  onSelectHotspot,
  onImageLoad,
  onImageError,
  warning,
}: GlobeFallbackProps) {
  const activeHotspot =
    dataset.hotspots.find((hotspot) => hotspot.id === activeHotspotId) ??
    dataset.hotspots[0];

  return (
    <div className="globe-fallback" data-testid="globe-fallback">
      <div className="globe-fallback__map">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={dataset.mapAsset.alt}
          className="globe-fallback__image"
          data-testid="globe-fallback-image"
          decoding="async"
          fetchPriority="high"
          height={dataset.mapAsset.height}
          onError={() => onImageError?.()}
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth > 0) {
              onImageLoad?.();
              return;
            }

            onImageError?.();
          }}
          src={dataset.mapAsset.publicUrl}
          width={dataset.mapAsset.width}
        />
        <div aria-hidden="true" className="globe-fallback__wash" />
        {dataset.hotspots.map((hotspot) => {
          const isActive = hotspot.id === activeHotspot.id;

          return (
            <button
              aria-label={`Abrir ${hotspot.title}`}
              className="globe-fallback__marker"
              data-active={isActive}
              key={hotspot.id}
              onClick={() => onSelectHotspot?.(hotspot.id)}
              style={{
                left: `${hotspot.mapX * 100}%`,
                top: `${hotspot.mapY * 100}%`,
              }}
              type="button"
            >
              <span />
            </button>
          );
        })}
      </div>

      <div className="globe-fallback__sidebar">
        <div>
          <p className="globe-fallback__eyebrow">Continentes em teste</p>
          <ol className="globe-fallback__list">
            {dataset.hotspots.map((hotspot) => (
              <li key={hotspot.id}>
                <button
                  aria-current={hotspot.id === activeHotspot.id ? "true" : undefined}
                  className="globe-fallback__item"
                  onClick={() => onSelectHotspot?.(hotspot.id)}
                  type="button"
                >
                  {hotspot.title}
                </button>
              </li>
            ))}
          </ol>
        </div>

        <GlobeFallbackDetails hotspot={activeHotspot} />

        <p className="globe-fallback__warning">
          {warning ??
            "Fallback 2D ativo. Esta leitura usa a mesma textura provisoria do globo para manter os seis hotspots coerentes com o prototipo 3D."}
        </p>
      </div>
    </div>
  );
}
