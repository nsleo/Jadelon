"use client";

import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { GlobeControls } from "@/components/globe/globe-controls";
import { GlobeLabControls } from "@/components/globe/globe-lab-controls";
import { GlobeFallback } from "@/components/globe/globe-fallback";
import { JadelonGlobeScene } from "@/components/globe/jadelon-globe-scene";
import { GlobeStatus } from "@/components/globe/globe-status";
import {
  appendTextureSwapLog,
} from "@/components/globe/texture-swap-machine";
import type {
  GlobeMaterialMode,
  GlobeMode,
  GlobeQualityKey,
  GlobeRenderState,
  GlobeRendererInfo,
  GlobeSceneCommand,
  GlobeTelemetry,
  GlobeTextureReadyPayload,
  PrototypeGlobeDataset,
  TextureSwapState,
} from "@/components/globe/types";
import {
  getGlobeQualityProfile,
} from "@/lib/globe/quality-profile";
import { detectWebglSupport } from "@/lib/globe/webgl-support";

const storageKeys = {
  mode: "jadelon.globe.mode",
  selectedHotspotId: "jadelon.globe.selectedHotspotId",
  quality: "jadelon.globe.quality",
  instructionSeen: "jadelon.globe.instructionSeen",
  webglFailure: "jadelon.globe.webglFailure",
  autoRotateEnabled: "jadelon.globe.autoRotateEnabled",
} as const;

function readSavedString(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
}

function readInitialMode() {
  const savedMode = readSavedString(storageKeys.mode);
  const savedWebglFailure = readSavedString(storageKeys.webglFailure);
  const support = detectWebglSupport();

  if (savedWebglFailure === "true" || !support.supported) {
    return "2d" as const;
  }

  return savedMode === "2d" ? "2d" : "3d";
}

function readInitialQuality() {
  const savedQuality = readSavedString(storageKeys.quality);

  if (
    savedQuality === "low" ||
    savedQuality === "medium" ||
    savedQuality === "high"
  ) {
    return savedQuality;
  }

  return "medium" as const;
}

function readInitialHotspotId(dataset: PrototypeGlobeDataset) {
  const savedHotspot = readSavedString(storageKeys.selectedHotspotId);

  if (savedHotspot && dataset.hotspots.some((hotspot) => hotspot.id === savedHotspot)) {
    return savedHotspot;
  }

  return dataset.hotspots[0]?.id ?? "";
}

function readInstructionState() {
  return readSavedString(storageKeys.instructionSeen) === "true";
}

function readWebglFailureState() {
  return readSavedString(storageKeys.webglFailure) === "true";
}

function readWebglSupportedState() {
  return detectWebglSupport().supported;
}

function readReducedMotionState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readAutoRotateState() {
  return readSavedString(storageKeys.autoRotateEnabled) !== "false";
}

function buildTextureIdentity({
  checksum,
  id,
  publicUrl,
}: PrototypeGlobeDataset["mapAsset"]) {
  return `${id}::${publicUrl}::${checksum ?? ""}`;
}

type SceneCommandInput =
  | { type: "none" }
  | { type: "rotate-quarter" }
  | { type: "focus-hotspot"; hotspotId: string; instant?: boolean }
  | {
      type: "set-view-preset";
      preset: "front" | "north" | "south" | "left" | "right" | "back";
      instant?: boolean;
    };

class GlobeSceneErrorBoundary extends Component<
  {
    children: React.ReactNode;
    onError: () => void;
  },
  {
    hasError: boolean;
  }
> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export function JadelonGlobeClient({
  dataset,
  instanceId = "globe-prototype",
  showDiagnostics = false,
}: {
  dataset: PrototypeGlobeDataset;
  instanceId?: string;
  showDiagnostics?: boolean;
}) {
  const [mode, setMode] = useState<GlobeMode>(readInitialMode);
  const [quality, setQuality] = useState<GlobeQualityKey>(readInitialQuality);
  const [selectedHotspotId, setSelectedHotspotId] = useState(() => readInitialHotspotId(dataset));
  const [instructionsSeen] = useState(readInstructionState);
  const [webglSupported] = useState<boolean>(readWebglSupportedState);
  const [webglFailure, setWebglFailure] = useState(readWebglFailureState);
  const [reducedMotion, setReducedMotion] = useState(readReducedMotionState);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(readAutoRotateState);
  const [interactionActive, setInteractionActive] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [materialMode, setMaterialMode] = useState<GlobeMaterialMode>("lit");
  const [rendererInfo, setRendererInfo] = useState<GlobeRendererInfo | null>(null);
  const [telemetry, setTelemetry] = useState<GlobeTelemetry | null>(null);
  const [visibilityByHotspotId, setVisibilityByHotspotId] = useState<Record<string, boolean>>({});
  const [rendererReady, setRendererReady] = useState(false);
  const [loadedTexture, setLoadedTexture] = useState<GlobeTextureReadyPayload | null>(null);
  const [textureSwapLog, setTextureSwapLog] = useState<TextureSwapState[]>([]);
  const [textureSwapState, setTextureSwapState] = useState<TextureSwapState>("idle");
  const [fallbackImageReady, setFallbackImageReady] = useState(false);
  const [sceneCommand, setSceneCommand] = useState<GlobeSceneCommand>({
    nonce: 0,
    type: "none",
  });
  const swapStateFrameRef = useRef<number | null>(null);
  const textureReadyFrameRef = useRef<number | null>(null);
  const globeShellRef = useRef<HTMLElement | null>(null);
  const textureSwapLogRef = useRef<TextureSwapState[]>([]);
  const textureSwapRequestRef = useRef(0);
  const loadingPublishedRef = useRef(false);
  const pendingTextureReadyRef = useRef<{
    payload: GlobeTextureReadyPayload;
    requestId: number;
  } | null>(null);
  const currentTextureIdentityRef = useRef(buildTextureIdentity(dataset.mapAsset));
  const sceneEnabled = mode === "3d" && webglSupported !== false && !webglFailure;

  const emitTextureSwapState = useCallback(
    (
      state: TextureSwapState,
      texturePayload: GlobeTextureReadyPayload | null = loadedTexture,
    ) => {
      if (typeof window === "undefined") {
        return;
      }

      window.dispatchEvent(
        new CustomEvent("jadelon:texture-swap-state", {
          detail: {
            assetId: dataset.mapAsset.id,
            checksum: dataset.mapAsset.checksum ?? null,
            instanceId,
            projection: dataset.mapAsset.projectionKey ?? "prototype",
            state,
            textureId: texturePayload?.textureId ?? "",
            textureUrl: texturePayload?.resolvedTextureUrl ?? texturePayload?.textureUrl ?? "",
          },
        }),
      );
    },
    [dataset.mapAsset, instanceId, loadedTexture],
  );

  const updateTextureSwapState = useCallback(
    (
      state: TextureSwapState,
      texturePayload: GlobeTextureReadyPayload | null = loadedTexture,
      options?: {
        resetLog?: boolean;
      },
    ) => {
      const nextLog = appendTextureSwapLog(textureSwapLogRef.current, state, {
        reset: options?.resetLog,
      });

      textureSwapLogRef.current = nextLog;
      setTextureSwapState(state);
      setTextureSwapLog(nextLog);
      if (globeShellRef.current) {
        if (nextLog.length > 0) {
          globeShellRef.current.dataset.textureSwapLog = nextLog.join(">");
        } else {
          delete globeShellRef.current.dataset.textureSwapLog;
        }
      }
      emitTextureSwapState(state, texturePayload);
    },
    [emitTextureSwapState, loadedTexture],
  );

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    reducedMotionQuery.addEventListener("change", handleMotionChange);
    return () => {
      reducedMotionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.mode, mode);
  }, [mode]);

  useEffect(() => {
    if (selectedHotspotId) {
      window.localStorage.setItem(storageKeys.selectedHotspotId, selectedHotspotId);
    }
  }, [selectedHotspotId]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.quality, quality);
  }, [quality]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.instructionSeen, "true");
  }, [instructionsSeen]);

  useEffect(() => {
    window.localStorage.setItem(
      storageKeys.autoRotateEnabled,
      autoRotateEnabled ? "true" : "false",
    );
  }, [autoRotateEnabled]);

  useEffect(() => {
    return () => {
      if (swapStateFrameRef.current) {
        window.cancelAnimationFrame(swapStateFrameRef.current);
      }

      if (textureReadyFrameRef.current) {
        window.cancelAnimationFrame(textureReadyFrameRef.current);
      }

      pendingTextureReadyRef.current = null;
    };
  }, []);

  useEffect(() => {
    currentTextureIdentityRef.current = buildTextureIdentity(dataset.mapAsset);
  }, [dataset.mapAsset]);

  useEffect(() => {
    if (!sceneEnabled) {
      return;
    }

    const currentIdentity = buildTextureIdentity(dataset.mapAsset);
    const loadedIdentity = loadedTexture
      ? `${loadedTexture.textureId}::${loadedTexture.textureUrl}::${loadedTexture.checksum ?? ""}`
      : null;

    if (currentIdentity === loadedIdentity) {
      return;
    }

    textureSwapRequestRef.current += 1;
    const requestId = textureSwapRequestRef.current;

    if (swapStateFrameRef.current) {
      window.cancelAnimationFrame(swapStateFrameRef.current);
    }

    if (textureReadyFrameRef.current) {
      window.cancelAnimationFrame(textureReadyFrameRef.current);
      textureReadyFrameRef.current = null;
    }

    pendingTextureReadyRef.current = null;
    loadingPublishedRef.current = false;

    swapStateFrameRef.current = window.requestAnimationFrame(() => {
      if (textureSwapRequestRef.current !== requestId) {
        return;
      }

      updateTextureSwapState("requested", null, { resetLog: true });
      swapStateFrameRef.current = window.requestAnimationFrame(() => {
        if (textureSwapRequestRef.current !== requestId) {
          return;
        }

        loadingPublishedRef.current = true;
        updateTextureSwapState("loading-texture");

        if (pendingTextureReadyRef.current?.requestId === requestId) {
          const pendingPayload = pendingTextureReadyRef.current.payload;
          pendingTextureReadyRef.current = null;
          updateTextureSwapState("applying-texture", pendingPayload);

          if (textureReadyFrameRef.current) {
            window.cancelAnimationFrame(textureReadyFrameRef.current);
          }

          textureReadyFrameRef.current = window.requestAnimationFrame(() => {
            textureReadyFrameRef.current = window.requestAnimationFrame(() => {
              if (textureSwapRequestRef.current !== requestId) {
                return;
              }

              setLoadedTexture(pendingPayload);
              updateTextureSwapState("ready-3d", pendingPayload);
              window.dispatchEvent(
                new CustomEvent("jadelon:texture-ready", {
                  detail: {
                    assetId: pendingPayload.textureId,
                    checksum: pendingPayload.checksum ?? null,
                    instanceId,
                    projection: dataset.mapAsset.projectionKey ?? "prototype",
                    textureUrl: pendingPayload.resolvedTextureUrl,
                  },
                }),
              );
              textureReadyFrameRef.current = null;
            });
          });
        }

        swapStateFrameRef.current = null;
      });
    });
  }, [dataset.mapAsset, instanceId, loadedTexture, sceneEnabled, updateTextureSwapState]);

  function handleSceneFailure() {
    window.localStorage.setItem(storageKeys.webglFailure, "true");
    setWebglFailure(true);
  }

  function issueSceneCommand(command: SceneCommandInput) {
    setSceneCommand((previous) => ({
      ...command,
      nonce: previous.nonce + 1,
    }) as GlobeSceneCommand);
  }

  function handleSelectHotspot(hotspotId: string) {
    setSelectedHotspotId(hotspotId);

    if (mode === "3d") {
      issueSceneCommand({
        hotspotId,
        instant: reducedMotion,
        type: "focus-hotspot",
      });
    }
  }

  function handleVisibilityChange(hotspotId: string, visible: boolean) {
    setVisibilityByHotspotId((current) => {
      if (current[hotspotId] === visible) {
        return current;
      }

      return {
        ...current,
        [hotspotId]: visible,
      };
    });
  }

  const handleSceneTelemetry = useCallback((payload: GlobeTelemetry) => {
    setTelemetry((current) => ({
      azimuthalAngle: payload.azimuthalAngle,
      canvasHeight: payload.canvasHeight || current?.canvasHeight || 0,
      canvasWidth: payload.canvasWidth || current?.canvasWidth || 0,
      distance: payload.distance,
      dpr: payload.dpr,
      polarAngle: payload.polarAngle,
    }));
  }, []);

  const handleSceneRendererReady = useCallback((payload: GlobeRendererInfo) => {
    setRendererInfo(payload);
    setRendererReady(true);
  }, []);

  const handleSceneTextureReady = useCallback((payload: GlobeTextureReadyPayload) => {
    const payloadIdentity = `${payload.textureId}::${payload.textureUrl}::${payload.checksum ?? ""}`;

    if (payloadIdentity !== currentTextureIdentityRef.current) {
      return;
    }

    const requestId = textureSwapRequestRef.current;

    if (!loadingPublishedRef.current) {
      pendingTextureReadyRef.current = {
        payload,
        requestId,
      };
      return;
    }

    updateTextureSwapState("applying-texture", payload);

    if (textureReadyFrameRef.current) {
      window.cancelAnimationFrame(textureReadyFrameRef.current);
    }

    textureReadyFrameRef.current = window.requestAnimationFrame(() => {
      textureReadyFrameRef.current = window.requestAnimationFrame(() => {
        if (textureSwapRequestRef.current !== requestId) {
          return;
        }

        setLoadedTexture(payload);
        updateTextureSwapState("ready-3d", payload);
        window.dispatchEvent(
          new CustomEvent("jadelon:texture-ready", {
            detail: {
              assetId: payload.textureId,
              checksum: payload.checksum ?? null,
              instanceId,
              projection: dataset.mapAsset.projectionKey ?? "prototype",
              textureUrl: payload.resolvedTextureUrl,
            },
          }),
        );
        textureReadyFrameRef.current = null;
      });
    });
  }, [dataset.mapAsset.projectionKey, instanceId, updateTextureSwapState]);

  const handleSceneFirstFrame = useCallback(() => {
    return;
  }, []);

  const handleSceneInteraction = useCallback((active: boolean) => {
    setInteractionActive(active);
  }, []);

  const handleSceneVisibilityChange = useCallback(
    (hotspotId: string, visible: boolean) => {
      handleVisibilityChange(hotspotId, visible);
    },
    [],
  );

  const activeHotspot =
    dataset.hotspots.find((hotspot) => hotspot.id === selectedHotspotId) ??
    dataset.hotspots[0];
  const textureMatchesCurrentAsset =
    loadedTexture?.textureId === dataset.mapAsset.id &&
    loadedTexture?.textureUrl === dataset.mapAsset.publicUrl &&
    loadedTexture?.checksum === dataset.mapAsset.checksum;
  const renderState: GlobeRenderState = !sceneEnabled
    ? fallbackImageReady
      ? "ready-2d"
      : "initializing"
    : webglFailure
      ? "error"
      : !rendererReady
        ? "checking-webgl"
        : textureMatchesCurrentAsset
          ? "ready-3d"
        : textureSwapState === "error"
          ? "error"
          : textureSwapState === "applying-texture"
            ? "applying-texture"
            : "loading-texture";
  const qualityProfile = getGlobeQualityProfile(quality);
  const modeLabel = sceneEnabled ? "Globo 3D ativo" : "Fallback 2D ativo";
  const selectedHotspotVisible = visibilityByHotspotId[activeHotspot.id] ?? false;
  const warning =
    webglSupported === false || webglFailure
      ? "WebGL indisponivel ou com falha anterior. O prototipo mudou automaticamente para o fallback 2D."
      : !selectedHotspotVisible && sceneEnabled
        ? "O continente selecionado esta fora da face frontal. Use centralizar continente para trazê-lo ao primeiro plano."
      : undefined;

  return (
    <section
      ref={globeShellRef}
      className="globe-shell"
      data-auto-rotate={
        sceneEnabled && autoRotateEnabled && !reducedMotion && !interactionActive ? "on" : "off"
      }
      data-globe-mode={sceneEnabled ? "3d" : "2d"}
      data-globe-instance={instanceId}
      data-loaded-texture-id={loadedTexture?.textureId ?? ""}
      data-loaded-texture-url={loadedTexture?.resolvedTextureUrl ?? ""}
      data-projection={dataset.mapAsset.projectionKey ?? "prototype"}
      data-globe-state={renderState}
      data-texture-swap-log={textureSwapLog.join(">")}
      data-texture-swap-state={textureSwapState}
      data-texture-checksum={dataset.mapAsset.checksum ?? ""}
      data-texture-id={dataset.mapAsset.id}
      data-texture-url={dataset.mapAsset.publicUrl}
      data-testid="globe-prototype"
    >
      <div className="globe-shell__viewer">
        <GlobeControls
          mode={mode}
          onModeChange={(nextMode) => {
            setMode(nextMode);
            setRendererReady(false);
            setFallbackImageReady(false);
            if (swapStateFrameRef.current) {
              window.cancelAnimationFrame(swapStateFrameRef.current);
              swapStateFrameRef.current = null;
            }
            if (textureReadyFrameRef.current) {
              window.cancelAnimationFrame(textureReadyFrameRef.current);
              textureReadyFrameRef.current = null;
            }
            pendingTextureReadyRef.current = null;
            loadingPublishedRef.current = false;
            setLoadedTexture(null);
            updateTextureSwapState("idle", null);
          }}
          onQualityChange={setQuality}
          quality={quality}
        />

        {sceneEnabled ? (
          <div className="globe-shell__stage">
            <GlobeSceneErrorBoundary onError={handleSceneFailure}>
              <JadelonGlobeScene
                autoRotateEnabled={autoRotateEnabled && !interactionActive}
                hotspots={dataset.hotspots}
                mapAsset={dataset.mapAsset}
                materialMode={materialMode}
                onFirstFrame={handleSceneFirstFrame}
                onInteractionChange={handleSceneInteraction}
                onRendererReady={handleSceneRendererReady}
                onSelectHotspot={handleSelectHotspot}
                onTelemetryChange={handleSceneTelemetry}
                onTextureReady={handleSceneTextureReady}
                onVisibilityChange={handleSceneVisibilityChange}
                quality={qualityProfile}
                reducedMotion={reducedMotion}
                sceneCommand={sceneCommand}
                selectedHotspotId={activeHotspot.id}
                showGrid={showGrid}
              />
            </GlobeSceneErrorBoundary>
            {selectedHotspotVisible ? (
              <div className="globe-stage-label" aria-hidden="true">
                <span>{activeHotspot.title}</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="globe-shell__stage">
            <GlobeFallback
              activeHotspotId={activeHotspot.id}
              dataset={dataset}
              onImageError={() => setFallbackImageReady(false)}
              onImageLoad={() => setFallbackImageReady(true)}
              onSelectHotspot={handleSelectHotspot}
              warning={warning}
            />
          </div>
        )}
      </div>

      <aside className="globe-shell__sidebar">
        <article className="globe-panel globe-panel--selected">
          <p className="globe-panel__eyebrow">Continente selecionado</p>
          <h2>{activeHotspot.title}</h2>
          <p>{activeHotspot.summary}</p>
        </article>

        <article className="globe-panel globe-panel--list">
          <p className="globe-panel__eyebrow">Continentes em teste</p>
          <ol className="globe-fallback__list">
            {dataset.hotspots.map((hotspot) => (
              <li key={hotspot.id}>
                <button
                  aria-current={hotspot.id === activeHotspot.id ? "true" : undefined}
                  className="globe-fallback__item"
                  onClick={() => handleSelectHotspot(hotspot.id)}
                  type="button"
                >
                  {hotspot.title}
                </button>
              </li>
            ))}
          </ol>
        </article>

        {showDiagnostics ? (
          <div className="globe-panel globe-panel--lab">
            <GlobeLabControls
              autoRotateEnabled={autoRotateEnabled}
              materialMode={materialMode}
              onFocusSelection={() =>
                issueSceneCommand({
                  hotspotId: activeHotspot.id,
                  instant: reducedMotion,
                  type: "focus-hotspot",
                })}
              onRotateQuarter={() => issueSceneCommand({ type: "rotate-quarter" })}
              onSetViewPreset={(preset) =>
                issueSceneCommand({ instant: reducedMotion, preset, type: "set-view-preset" })
              }
              onToggleAutoRotate={() => setAutoRotateEnabled((current) => !current)}
              onToggleGrid={() => setShowGrid((current) => !current)}
              onToggleMaterial={() =>
                setMaterialMode((current) => (current === "lit" ? "basic" : "lit"))
              }
              rendererInfo={rendererInfo}
              showGrid={showGrid}
              telemetry={telemetry}
              textureChecksum={loadedTexture?.checksum ?? dataset.mapAsset.checksum}
              textureId={loadedTexture?.textureId ?? dataset.mapAsset.id}
              textureState={renderState}
              textureUrl={loadedTexture?.resolvedTextureUrl ?? dataset.mapAsset.publicUrl}
              latitudeBand={dataset.mapAsset.latitudeBand}
              projectionKey={dataset.mapAsset.projectionKey}
            />
          </div>
        ) : null}

        <GlobeStatus
          instructionsSeen={instructionsSeen}
          modeLabel={modeLabel}
          qualityLabel={qualityProfile.label}
          warning={warning}
        />

        {showDiagnostics ? (
          <article className="globe-panel globe-panel--diagnostics">
            <p className="globe-panel__eyebrow">Diagnostico do prototipo</p>
            <dl className="globe-panel__diagnostics">
              <div>
                <dt>Estado</dt>
                <dd>{renderState}</dd>
              </div>
              <div>
                <dt>WebGL</dt>
                <dd>{webglSupported === false ? "indisponivel" : "ativo ou elegivel"}</dd>
              </div>
              <div>
                <dt>Modo visivel</dt>
                <dd>{sceneEnabled ? "3d" : "2d"}</dd>
              </div>
              <div>
                <dt>Textura</dt>
                <dd>{dataset.mapAsset.width} x {dataset.mapAsset.height}</dd>
              </div>
              <div>
                <dt>Asset ID</dt>
                <dd>{dataset.mapAsset.id}</dd>
              </div>
              <div>
                <dt>Checksum</dt>
                <dd>{(dataset.mapAsset.checksum ?? "n/a").slice(0, 8)}</dd>
              </div>
              <div>
                <dt>Projection</dt>
                <dd>{dataset.mapAsset.projectionKey ?? "prototype"}</dd>
              </div>
              <div>
                <dt>Textura carregada</dt>
                <dd>{loadedTexture?.resolvedTextureUrl ?? dataset.mapAsset.publicUrl}</dd>
              </div>
              <div>
                <dt>Hotspots</dt>
                <dd>{dataset.hotspots.length} continentes</dd>
              </div>
              <div>
                <dt>Canvas</dt>
                <dd>
                  {telemetry
                    ? `${Math.round(telemetry.canvasWidth)} x ${Math.round(telemetry.canvasHeight)}`
                    : "..."}
                </dd>
              </div>
              <div>
                <dt>DPR</dt>
                <dd>{telemetry ? telemetry.dpr.toFixed(2) : "..."}</dd>
              </div>
              <div>
                <dt>Coordenadas</dt>
                <dd>technical.prototypeGlobePoint</dd>
              </div>
            </dl>
          </article>
        ) : null}
      </aside>
    </section>
  );
}
