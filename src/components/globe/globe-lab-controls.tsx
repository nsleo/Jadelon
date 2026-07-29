import type {
  GlobeMaterialMode,
  GlobeRendererInfo,
  GlobeTelemetry,
} from "@/components/globe/types";

type GlobeLabControlsProps = {
  autoRotateEnabled: boolean;
  onToggleAutoRotate: () => void;
  onRotateQuarter: () => void;
  onFocusSelection: () => void;
  onSetViewPreset: (
    preset: "front" | "north" | "south" | "left" | "right" | "back",
  ) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  materialMode: GlobeMaterialMode;
  onToggleMaterial: () => void;
  telemetry: GlobeTelemetry | null;
  rendererInfo: GlobeRendererInfo | null;
  textureId?: string;
  textureUrl?: string;
  textureChecksum?: string;
  textureState: string;
  latitudeBand?: number;
  projectionKey?: string;
};

function formatRadians(value: number) {
  return `${value.toFixed(2)} rad`;
}

export function GlobeLabControls({
  autoRotateEnabled,
  onToggleAutoRotate,
  onRotateQuarter,
  onFocusSelection,
  onSetViewPreset,
  showGrid,
  onToggleGrid,
  materialMode,
  onToggleMaterial,
  telemetry,
  rendererInfo,
  textureChecksum,
  textureId,
  textureState,
  textureUrl,
  latitudeBand,
  projectionKey,
}: GlobeLabControlsProps) {
  return (
    <section
      aria-label="Controles de laboratorio do globo"
      className="globe-lab-controls"
      data-testid="globe-lab-controls-root"
    >
      <div className="globe-lab-controls__actions">
        <button className="globe-controls__button" onClick={onToggleGrid} type="button">
          {showGrid ? "Ocultar grade" : "Mostrar grade"}
        </button>
        <button
          aria-pressed={autoRotateEnabled}
          className="globe-controls__button"
          data-rotation-state={autoRotateEnabled ? "running" : "paused"}
          data-testid="globe-rotation-toggle"
          onClick={onToggleAutoRotate}
          type="button"
        >
          {autoRotateEnabled ? "Pausar rotacao" : "Retomar rotacao"}
        </button>
        <button className="globe-controls__button" onClick={onRotateQuarter} type="button">
          Girar 90 deg
        </button>
        <button className="globe-controls__button" onClick={onFocusSelection} type="button">
          Centralizar continente
        </button>
        <button className="globe-controls__button" onClick={onToggleMaterial} type="button">
          Material {materialMode === "basic" ? "basico" : "iluminado"}
        </button>
      </div>
      <div className="globe-lab-controls__actions">
        <button className="globe-controls__button" onClick={() => onSetViewPreset("front")} type="button">
          Frente
        </button>
        <button className="globe-controls__button" onClick={() => onSetViewPreset("north")} type="button">
          Norte
        </button>
        <button className="globe-controls__button" onClick={() => onSetViewPreset("south")} type="button">
          Sul
        </button>
        <button className="globe-controls__button" onClick={() => onSetViewPreset("left")} type="button">
          Esquerda
        </button>
        <button className="globe-controls__button" onClick={() => onSetViewPreset("right")} type="button">
          Direita
        </button>
        <button className="globe-controls__button" onClick={() => onSetViewPreset("back")} type="button">
          Traseira
        </button>
      </div>

      <dl className="globe-lab-controls__readout">
        <div>
          <dt>Projecao</dt>
          <dd>{projectionKey ?? "prototype"}</dd>
        </div>
        <div>
          <dt>Asset</dt>
          <dd>{textureId ?? "..."}</dd>
        </div>
        <div>
          <dt>Checksum</dt>
          <dd>{textureChecksum ? textureChecksum.slice(0, 8) : "..."}</dd>
        </div>
        <div>
          <dt>Faixa</dt>
          <dd>{latitudeBand ? `+${latitudeBand} / -${latitudeBand}` : "n/a"}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{textureState}</dd>
        </div>
        <div>
          <dt>Textura</dt>
          <dd>{textureUrl ?? "..."}</dd>
        </div>
        <div>
          <dt>Azimute</dt>
          <dd>{telemetry ? formatRadians(telemetry.azimuthalAngle) : "..."}</dd>
        </div>
        <div>
          <dt>Polar</dt>
          <dd>{telemetry ? formatRadians(telemetry.polarAngle) : "..."}</dd>
        </div>
        <div>
          <dt>Distancia</dt>
          <dd>{telemetry ? telemetry.distance.toFixed(2) : "..."}</dd>
        </div>
        <div>
          <dt>Canvas</dt>
          <dd>
            {telemetry
              ? `${Math.round(telemetry.canvasWidth)}x${Math.round(telemetry.canvasHeight)} @ ${telemetry.dpr.toFixed(2)}`
              : "..."}
          </dd>
        </div>
        <div>
          <dt>Renderer</dt>
          <dd>{rendererInfo?.renderer ?? "..."}</dd>
        </div>
        <div>
          <dt>AA</dt>
          <dd>{rendererInfo?.antialias ? "ativo" : "desligado"}</dd>
        </div>
      </dl>
    </section>
  );
}
