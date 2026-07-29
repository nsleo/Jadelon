"use client";
/* eslint-disable @next/next/no-img-element */

import {
  useMemo,
  useState,
} from "react";

import { JadelonGlobeDynamic } from "@/components/globe/jadelon-globe-dynamic";
import type { GlobeMapAsset } from "@/components/globe/types";
import {
  AtlasLabel,
  SectionFrame,
  SectionHeading,
} from "@/components/site/primitives";
import {
  getCartographyCandidateAsset,
} from "@/lib/cartography/candidate-assets";
import {
  candidateContinentShapes,
  getCandidateContinentShape,
  getShapeBounds,
  getShapePolygonSets,
} from "@/lib/cartography/continent-shapes";
import { createPrototypeGlobeDataset } from "@/lib/globe/prototype-points";
import type {
  CartographyCandidateAsset,
  ContinentShape,
} from "@/types/cartography";

type ReviewLayer = {
  id: string;
  label: string;
  family: "map" | "projection" | "control";
  imageUrl: string;
  alt: string;
  width: number;
  height: number;
  checksum?: string;
  latitudeBand?: number;
  notes?: string;
  projectionKey?: string;
  sourceAssetId?: string;
};

const originalLayer: ReviewLayer = {
  id: "mapa-mundi-original",
  label: "Original",
  family: "map",
  imageUrl: "/assets/jadelon/maps/prototype/jadelon-shell-map-background.webp",
  alt: "Mapa original com labels usado apenas como referencia historica.",
  width: 2048,
  height: 1536,
  notes: "Referencia historica com labels rasterizados.",
};

const controlLayer: ReviewLayer = {
  id: "map-globe-prototype",
  label: "Controle",
  family: "control",
  imageUrl: "/assets/jadelon/maps/prototype/mapa-globo-prototype.webp",
  alt: "Textura do prototipo aprovado anterior, mantida como controle comparativo.",
  width: 2048,
  height: 1024,
  notes: "Controle visual historico.",
  projectionKey: "control",
};

function toReviewLayer(
  asset: CartographyCandidateAsset,
  label: string,
  family: ReviewLayer["family"],
  notes?: string,
) {
  if (!asset.publicUrl || !asset.width || !asset.height) {
    throw new Error(`Cartography asset "${asset.id}" is missing public runtime metadata.`);
  }

  return {
    id: asset.id,
    label,
    family,
    imageUrl: asset.publicUrl,
    alt: asset.alt ?? "",
    width: asset.width,
    height: asset.height,
    checksum: asset.checksum,
    latitudeBand: asset.latitudeBand,
    notes,
    projectionKey: asset.projectionKey,
    sourceAssetId: asset.sourceAssetId,
  };
}

const atlasLayer = toReviewLayer(
  getCartographyCandidateAsset("mapa-atlas-clean-source-candidate")!,
  "Atlas limpo",
  "map",
  "Fonte mestre visual da fase atual.",
);

const projectionLayers = [
  toReviewLayer(getCartographyCandidateAsset("mapa-globo-projection-p55")!, "P55", "projection"),
  toReviewLayer(getCartographyCandidateAsset("mapa-globo-projection-p60")!, "P60", "projection"),
  toReviewLayer(getCartographyCandidateAsset("mapa-globo-projection-p65")!, "P65", "projection"),
] as const;

const reviewLayers: ReviewLayer[] = [
  originalLayer,
  atlasLayer,
  ...projectionLayers,
  controlLayer,
];

function polygonArea(points: Array<{ x: number; y: number }>) {
  let area = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area / 2);
}

function getShapeArea(shape: ContinentShape) {
  return getShapePolygonSets(shape).reduce((sum, polygon) => sum + polygonArea(polygon), 0);
}

function buildGlobeMapAsset(layer: ReviewLayer): GlobeMapAsset {
  return {
    id: layer.id,
    publicUrl: layer.imageUrl,
    width: layer.width,
    height: layer.height,
    alt: layer.alt,
    checksum: layer.checksum,
    projectionKey: layer.projectionKey,
    latitudeBand: layer.latitudeBand,
    sourceAssetId: layer.sourceAssetId,
  };
}

function GlobeCard({
  layer,
  testId,
}: {
  layer: ReviewLayer;
  testId: string;
}) {
  const dataset = useMemo(
    () => createPrototypeGlobeDataset(buildGlobeMapAsset(layer)),
    [layer],
  );

  return (
    <article className="cartography-panel cartography-panel--globe" data-testid={testId}>
      <div className="cartography-panel__header">
        <p className="cartography-panel__eyebrow">{layer.label}</p>
        <p className="cartography-panel__caption">
          {layer.latitudeBand
            ? `Faixa tecnica aproximada: +${layer.latitudeBand} / -${layer.latitudeBand}`
            : layer.notes}
        </p>
      </div>
      <JadelonGlobeDynamic dataset={dataset} instanceId={testId} showDiagnostics />
    </article>
  );
}

export function CartographyCalibration() {
  const [activeLayerId, setActiveLayerId] = useState<string>(atlasLayer.id);
  const [selectedProjectionId, setSelectedProjectionId] = useState<string>(
    projectionLayers[0].id,
  );
  const [selectedContinentId, setSelectedContinentId] = useState(
    candidateContinentShapes[0]?.id ?? "",
  );
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [maskVisible, setMaskVisible] = useState(true);
  const [hotspotsVisible, setHotspotsVisible] = useState(true);
  const [borderVisible, setBorderVisible] = useState(true);
  const [darkBackdrop, setDarkBackdrop] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.68);
  const [zoom, setZoom] = useState(1);

  const activeLayer =
    reviewLayers.find((layer) => layer.id === activeLayerId) ?? atlasLayer;
  const selectedProjection =
    projectionLayers.find((layer) => layer.id === selectedProjectionId) ?? projectionLayers[0];
  const selectedProjectionDataset = useMemo(
    () => createPrototypeGlobeDataset(buildGlobeMapAsset(selectedProjection)),
    [selectedProjection],
  );
  const selectedShape =
    getCandidateContinentShape(selectedContinentId) ?? candidateContinentShapes[0];
  const selectedBounds = getShapeBounds(selectedShape);
  const selectedArea = getShapeArea(selectedShape);
  const coveragePercent = (selectedArea / (2048 * 1536)) * 100;
  const supportsOverlay = activeLayer.family === "map";

  return (
    <div className="cartography-page">
      <SectionFrame className="cartography-page__hero">
        <div>
          <AtlasLabel>Rota interna</AtlasLabel>
          <SectionHeading
            title="Calibracao cartografica"
            description="Laboratorio interno para validar a fonte limpa oficial, provar a textura real carregada em P55, P60 e P65, revisar seams, backside e trocar candidatos sem contaminar o runtime publico."
          />
        </div>
      </SectionFrame>

      <div className="cartography-lab" data-testid="cartography-lab">
        <SectionFrame className="cartography-lab__controls">
          <article className="cartography-panel">
            <p className="cartography-panel__eyebrow">Camadas</p>
            <div className="cartography-chip-list">
              {reviewLayers.map((layer) => (
                <button
                  key={layer.id}
                  className="cartography-chip"
                  data-active={layer.id === activeLayer.id ? "true" : "false"}
                  onClick={() => setActiveLayerId(layer.id)}
                  type="button"
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </article>

          <article className="cartography-panel">
            <p className="cartography-panel__eyebrow">Continente</p>
            <select
              className="cartography-select"
              value={selectedShape.id}
              onChange={(event) => setSelectedContinentId(event.target.value)}
            >
              {candidateContinentShapes.map((shape) => (
                <option key={shape.id} value={shape.id}>
                  {shape.name}
                </option>
              ))}
            </select>
            <div className="cartography-switches">
              <label>
                <input
                  checked={overlayVisible}
                  disabled={!supportsOverlay}
                  onChange={() => setOverlayVisible((value) => !value)}
                  type="checkbox"
                />
                Overlay
              </label>
              <label>
                <input
                  checked={maskVisible}
                  disabled={!supportsOverlay}
                  onChange={() => setMaskVisible((value) => !value)}
                  type="checkbox"
                />
                Mascara
              </label>
              <label>
                <input
                  checked={hotspotsVisible}
                  disabled={!supportsOverlay}
                  onChange={() => setHotspotsVisible((value) => !value)}
                  type="checkbox"
                />
                Hotspots
              </label>
              <label>
                <input
                  checked={borderVisible}
                  disabled={!supportsOverlay}
                  onChange={() => setBorderVisible((value) => !value)}
                  type="checkbox"
                />
                Bordas
              </label>
              <label>
                <input
                  checked={darkBackdrop}
                  onChange={() => setDarkBackdrop((value) => !value)}
                  type="checkbox"
                />
                Fundo escuro
              </label>
            </div>
          </article>

          <article className="cartography-panel">
            <p className="cartography-panel__eyebrow">Opacidade e zoom</p>
            <label className="cartography-slider">
              <span>Overlay {Math.round(overlayOpacity * 100)}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(overlayOpacity * 100)}
                onChange={(event) => setOverlayOpacity(Number(event.target.value) / 100)}
              />
            </label>
            <label className="cartography-slider">
              <span>Zoom {zoom.toFixed(2)}x</span>
              <input
                type="range"
                min="1"
                max="2.25"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>
          </article>
        </SectionFrame>

        <SectionFrame className="cartography-lab__stage-wrap">
          <div
            className="cartography-stage"
            data-backdrop={darkBackdrop ? "dark" : "light"}
            data-testid="cartography-stage"
          >
            <div
              className="cartography-stage__viewport"
              style={{ transform: `scale(${zoom})` }}
            >
              <img
                alt={activeLayer.alt}
                className="cartography-stage__image"
                data-testid="cartography-active-image"
                src={activeLayer.imageUrl}
              />

              {supportsOverlay && maskVisible ? (
                <img
                  alt={`Mascara de ${selectedShape.name}`}
                  className="cartography-stage__mask"
                  data-testid="cartography-mask-image"
                  src={`/assets/jadelon/maps/candidates/masks/${selectedShape.slug}-mask.webp`}
                  style={{ opacity: overlayOpacity * 0.9 }}
                />
              ) : null}

              {supportsOverlay && overlayVisible ? (
                <svg
                  className="cartography-stage__overlay"
                  viewBox="0 0 2048 1536"
                  aria-hidden="true"
                >
                  {candidateContinentShapes.map((shape) => (
                    <g key={shape.id}>
                      {getShapePolygonSets(shape).map((polygon, index) => (
                        <polygon
                          key={`${shape.id}-${index}`}
                          points={polygon.map((point) => `${point.x},${point.y}`).join(" ")}
                          fill={
                            shape.id === selectedShape.id
                              ? `rgba(208, 168, 87, ${overlayOpacity})`
                              : `rgba(140, 173, 198, ${overlayOpacity * 0.36})`
                          }
                          stroke={borderVisible ? "rgba(255, 244, 217, 0.9)" : "transparent"}
                          strokeWidth={shape.id === selectedShape.id ? 5 : 2}
                        />
                      ))}
                    </g>
                  ))}
                </svg>
              ) : null}

              {supportsOverlay && hotspotsVisible ? (
                <div className="cartography-stage__hotspots" aria-hidden="true">
                  {candidateContinentShapes.map((shape) => {
                    const bounds = getShapeBounds(shape);
                    const left = ((bounds.minX + bounds.maxX) / 2 / 2048) * 100;
                    const top = ((bounds.minY + bounds.maxY) / 2 / 1536) * 100;

                    return (
                      <span
                        key={shape.id}
                        className="cartography-hotspot"
                        data-active={shape.id === selectedShape.id ? "true" : "false"}
                        style={{ left: `${left}%`, top: `${top}%` }}
                      >
                        {shape.name}
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="cartography-report" data-testid="cartography-overlay-report">
            <article className="cartography-panel">
              <p className="cartography-panel__eyebrow">Relatorio tecnico</p>
              <dl className="cartography-facts">
                <div>
                  <dt>Asset ativo</dt>
                  <dd>{activeLayer.label}</dd>
                </div>
                <div>
                  <dt>Dimensoes</dt>
                  <dd>
                    {activeLayer.width} x {activeLayer.height}
                  </dd>
                </div>
                <div>
                  <dt>Continente</dt>
                  <dd>{selectedShape.name}</dd>
                </div>
                <div>
                  <dt>Confianca</dt>
                  <dd>{selectedShape.confidence}</dd>
                </div>
                <div>
                  <dt>Bounding box</dt>
                  <dd>
                    {Math.round(selectedBounds.minX)}-{Math.round(selectedBounds.maxX)} /{" "}
                    {Math.round(selectedBounds.minY)}-{Math.round(selectedBounds.maxY)}
                  </dd>
                </div>
                <div>
                  <dt>Area estimada</dt>
                  <dd>{coveragePercent.toFixed(2)}% do mapa</dd>
                </div>
                <div>
                  <dt>Faixa tecnica</dt>
                  <dd>
                    {activeLayer.latitudeBand
                      ? `+${activeLayer.latitudeBand} / -${activeLayer.latitudeBand}`
                      : "n/a"}
                  </dd>
                </div>
                <div>
                  <dt>Sem lat/long canonica</dt>
                  <dd>sim</dd>
                </div>
              </dl>
            </article>

            <article className="cartography-panel">
              <p className="cartography-panel__eyebrow">Situacao da fase</p>
              <ul className="cartography-notes">
                <li>Fonte mestre nova: `mapa-mundi-original-sem-labels.png`.</li>
                <li>Candidatos borrados antigos: historico apenas, sem alimentar derivados.</li>
                <li>P55, P60 e P65: faixas tecnicas de projeção, nao coordenadas canonicas.</li>
                <li>O globo do laboratorio agora deve carregar o asset real indicado no painel.</li>
              </ul>
            </article>
          </div>
        </SectionFrame>

        <SectionFrame className="cartography-lab__stage-wrap">
          <article className="cartography-panel" data-testid="cartography-projection-verifier">
            <div className="cartography-panel__header">
              <p className="cartography-panel__eyebrow">Verificador unico de projeção</p>
              <p className="cartography-panel__caption">
                Troca P55, P60 e P65 na mesma instância para provar `loading-texture`, URL real e checksum.
              </p>
            </div>
            <div className="cartography-chip-list">
              {projectionLayers.map((layer) => (
                <button
                  key={layer.id}
                  className="cartography-chip"
                  data-active={layer.id === selectedProjection.id ? "true" : "false"}
                  data-testid={`projection-switch-${layer.projectionKey}`}
                  onClick={() => {
                    if (layer.id === selectedProjection.id) {
                      return;
                    }

                    setSelectedProjectionId(layer.id);
                  }}
                  type="button"
                >
                  {layer.label}
                </button>
              ))}
            </div>
            <div data-testid="cartography-projection-live">
              <JadelonGlobeDynamic
                dataset={selectedProjectionDataset}
                instanceId="cartography-projection-live"
                showDiagnostics
              />
            </div>
          </article>
        </SectionFrame>

        <SectionFrame className="cartography-lab__stage-wrap">
          <article className="cartography-panel" data-testid="cartography-seam-preview">
            <p className="cartography-panel__eyebrow">Emenda lateral</p>
            <div className="cartography-seam-grid">
              {projectionLayers.map((layer) => (
                <figure key={layer.id} className="cartography-seam-card">
                  <figcaption>{layer.label}</figcaption>
                  <div className="cartography-seam-card__sides">
                    <div className="cartography-seam-card__crop">
                      <img
                        alt={`${layer.label} lateral esquerda`}
                        src={layer.imageUrl}
                        style={{
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "left center",
                          width: "100%",
                        }}
                      />
                    </div>
                    <div className="cartography-seam-card__crop">
                      <img
                        alt={`${layer.label} lateral direita`}
                        src={layer.imageUrl}
                        style={{
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "right center",
                          width: "100%",
                        }}
                      />
                    </div>
                  </div>
                </figure>
              ))}
            </div>
          </article>
        </SectionFrame>

        <SectionFrame className="cartography-lab__stage-wrap">
          <article className="cartography-panel" data-testid="cartography-masks-all">
            <p className="cartography-panel__eyebrow">Mascaras e hit areas candidatas</p>
            <div className="cartography-mask-grid">
              {candidateContinentShapes.map((shape) => (
                <figure key={shape.id} className="cartography-mask-card">
                  <img
                    alt={`Mascara candidata de ${shape.name}`}
                    src={`/assets/jadelon/maps/candidates/masks/${shape.slug}-mask.webp`}
                  />
                  <figcaption>{shape.name}</figcaption>
                </figure>
              ))}
            </div>
          </article>
        </SectionFrame>

        <SectionFrame className="cartography-lab__stage-wrap">
          <div className="cartography-globe-grid" data-testid="cartography-projection-identities">
            <GlobeCard layer={projectionLayers[0]} testId="cartography-globe-p55" />
            <GlobeCard layer={projectionLayers[1]} testId="cartography-globe-p60" />
            <GlobeCard layer={projectionLayers[2]} testId="cartography-globe-p65" />
          </div>
        </SectionFrame>

        <SectionFrame className="cartography-lab__stage-wrap">
          <div className="cartography-globe-grid">
            <GlobeCard layer={controlLayer} testId="cartography-globe-control" />
          </div>
        </SectionFrame>
      </div>
    </div>
  );
}
