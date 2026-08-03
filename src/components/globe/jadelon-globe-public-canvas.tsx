"use client";

import {
  Component,
  useMemo,
  useState,
} from "react";

import { JadelonGlobeScene } from "@/components/globe/jadelon-globe-scene";
import type {
  GlobeMapAsset,
  GlobeRenderState,
  GlobeTextureReadyPayload,
} from "@/components/globe/types";
import { getGlobeQualityProfile } from "@/lib/globe/quality-profile";

class PublicGlobeErrorBoundary extends Component<
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

type JadelonGlobePublicCanvasProps = {
  mapAsset: GlobeMapAsset;
  reducedMotion: boolean;
  onInteractionChange: (active: boolean) => void;
  onStateChange: (state: GlobeRenderState) => void;
  onTextureReady: (payload: GlobeTextureReadyPayload) => void;
  onWebglError: () => void;
};

export function JadelonGlobePublicCanvas({
  mapAsset,
  reducedMotion,
  onInteractionChange,
  onStateChange,
  onTextureReady,
  onWebglError,
}: JadelonGlobePublicCanvasProps) {
  const [interactionActive, setInteractionActive] = useState(false);
  const [rendererReady, setRendererReady] = useState(false);
  const [loadedTexture, setLoadedTexture] = useState<GlobeTextureReadyPayload | null>(null);
  const quality = useMemo(() => {
    const profile = getGlobeQualityProfile("medium");

    return {
      ...profile,
      anisotropy: 2,
      antialias: false,
      autoRotateSpeed: 0.12,
      dpr: 1.2,
      segments: 60,
    };
  }, []);

  const renderState: GlobeRenderState = !rendererReady
    ? "checking-webgl"
    : loadedTexture?.textureId === mapAsset.id &&
        loadedTexture?.resolvedTextureUrl === mapAsset.publicUrl
      ? "ready-3d"
      : "loading-texture";

  return (
    <div className="public-globe-runtime__canvas" data-scene-state={renderState}>
      <PublicGlobeErrorBoundary
        onError={() => {
          onStateChange("error");
          onWebglError();
        }}
      >
        <JadelonGlobeScene
          autoRotateEnabled={!interactionActive && !reducedMotion}
          backgroundColor={null}
          cameraDistance={3.15}
          controlsDampingFactor={0.085}
          controlsMaxDistance={4.35}
          controlsMinDistance={2.75}
          controlsRotateSpeed={0.96}
          controlsZoomSpeed={0.52}
          enableShadows={false}
          globeRotation={[0.16, 1.02, -0.02]}
          globeScale={1.34}
          hotspots={[]}
          mapAsset={mapAsset}
          materialMode="lit"
          onFirstFrame={() => undefined}
          onInteractionChange={(active) => {
            setInteractionActive(active);
            onInteractionChange(active);
          }}
          onRendererReady={() => {
            setRendererReady(true);
            onStateChange("loading-texture");
          }}
          onSelectHotspot={() => undefined}
          onTelemetryChange={() => undefined}
          onTextureReady={(payload) => {
            setLoadedTexture(payload);
            onTextureReady(payload);
            onStateChange("ready-3d");
          }}
          onVisibilityChange={() => undefined}
          quality={quality}
          reducedMotion={reducedMotion}
          sceneCommand={{ nonce: 0, type: "none" }}
          selectedHotspotId=""
          showGrid={false}
        />
      </PublicGlobeErrorBoundary>
    </div>
  );
}
