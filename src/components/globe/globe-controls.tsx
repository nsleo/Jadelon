import type {
  GlobeMode,
  GlobeQualityKey,
} from "@/components/globe/types";

type GlobeControlsProps = {
  mode: GlobeMode;
  onModeChange: (mode: GlobeMode) => void;
  quality: GlobeQualityKey;
  onQualityChange: (quality: GlobeQualityKey) => void;
};

export function GlobeControls({
  mode,
  onModeChange,
  quality,
  onQualityChange,
}: GlobeControlsProps) {
  return (
    <div className="globe-controls">
      <div className="globe-controls__group" role="group" aria-label="Modo de visualizacao">
        <button
          aria-pressed={mode === "3d"}
          className="globe-controls__button"
          onClick={() => onModeChange("3d")}
          type="button"
        >
          Globo 3D
        </button>
        <button
          aria-pressed={mode === "2d"}
          className="globe-controls__button"
          onClick={() => onModeChange("2d")}
          type="button"
        >
          Mapa 2D
        </button>
      </div>

      <label className="globe-controls__quality">
        <span>Qualidade</span>
        <select
          aria-label="Qualidade do globo"
          onChange={(event) => onQualityChange(event.target.value as GlobeQualityKey)}
          value={quality}
        >
          <option value="low">Baixa</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </label>
    </div>
  );
}
