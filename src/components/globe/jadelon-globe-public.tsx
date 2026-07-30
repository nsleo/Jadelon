"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { GlobeMapAsset, GlobeRenderState, GlobeTextureReadyPayload } from "@/components/globe/types";
import { CartographicImage } from "@/components/site/cartographic-image";
import {
  resolvePublicGlobeAutoRotate,
  resolvePublicGlobeState,
  shouldEnablePublicGlobe3D,
} from "@/lib/globe/public-globe-runtime";
import { detectWebglSupport } from "@/lib/globe/webgl-support";

const JadelonGlobePublicCanvas = dynamic(
  () =>
    import("./jadelon-globe-public-canvas").then((module) => module.JadelonGlobePublicCanvas),
  {
    ssr: false,
  },
);

const mobileFallbackQuery = "(max-width: 900px), (pointer: coarse)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

type JadelonGlobePublicProps = {
  fallbackAsset: GlobeMapAsset;
  mapAsset: GlobeMapAsset;
  priority?: boolean;
};

export function JadelonGlobePublic({
  fallbackAsset,
  mapAsset,
  priority = false,
}: JadelonGlobePublicProps) {
  const [globeState, setGlobeState] = useState<GlobeRenderState>("initializing");
  const [isMobileFallback, setIsMobileFallback] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [interactionActive, setInteractionActive] = useState(false);
  const [loadedTexture, setLoadedTexture] = useState<GlobeTextureReadyPayload | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia(mobileFallbackQuery);
    const motionQuery = window.matchMedia(reducedMotionQuery);

    const applyPreferences = () => {
      const prefersFallback = mobileQuery.matches;
      const prefersReducedMotion = motionQuery.matches;
      const support = detectWebglSupport().supported;
      const nextWebglEnabled = shouldEnablePublicGlobe3D({
        prefersFallback,
        webglFailed,
        webglSupported: support,
      });

      setIsMobileFallback(prefersFallback);
      setReducedMotion(prefersReducedMotion);
      setWebglReady(nextWebglEnabled);
      setGlobeState(
        resolvePublicGlobeState({
          hasReadyTexture: false,
          prefersFallback,
          webglFailed,
          webglSupported: support,
        }),
      );
    };

    applyPreferences();

    const handleMobileChange = () => applyPreferences();
    const handleMotionChange = () => applyPreferences();

    mobileQuery.addEventListener("change", handleMobileChange);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      mobileQuery.removeEventListener("change", handleMobileChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [webglFailed]);

  const fallbackVisible = globeState !== "ready-3d";
  const autoRotateState = resolvePublicGlobeAutoRotate({
    interactionActive,
    reducedMotion,
    webglEnabled: webglReady,
  });

  return (
    <section
      aria-label="Globo exploravel de Jadelon"
      className="public-globe"
      data-auto-rotate={autoRotateState}
      data-fallback-asset-id={fallbackAsset.id}
      data-fallback-visible={fallbackVisible ? "true" : "false"}
      data-globe-mode={globeState === "ready-3d" ? "3d" : "2d"}
      data-globe-state={globeState}
      data-hero-visual={isMobileFallback ? "fallback" : "globe"}
      data-loaded-texture-id={loadedTexture?.textureId ?? ""}
      data-loaded-texture-url={loadedTexture?.resolvedTextureUrl ?? ""}
      data-testid="public-globe"
      data-texture-id={mapAsset.id}
      data-texture-url={mapAsset.publicUrl}
    >
      <div
        className="public-globe__fallback"
        data-state={fallbackVisible ? "visible" : "hidden"}
        data-testid="public-globe-fallback"
      >
        <CartographicImage
          alt={fallbackAsset.alt}
          className="public-globe__fallback-image"
          priority={priority}
          sizes="(max-width: 900px) 100vw, 62vw"
          src={fallbackAsset.publicUrl}
        />
        <div aria-hidden="true" className="public-globe__veil" />
      </div>

      {webglReady ? (
        <div className="public-globe__runtime" data-visible={globeState === "ready-3d"}>
          <JadelonGlobePublicCanvas
            mapAsset={mapAsset}
            onInteractionChange={setInteractionActive}
            onStateChange={setGlobeState}
            onTextureReady={(payload) => {
              setLoadedTexture(payload);
              setGlobeState("ready-3d");
            }}
            onWebglError={() => {
              setWebglFailed(true);
              setGlobeState("ready-2d");
            }}
            reducedMotion={reducedMotion}
          />
        </div>
      ) : null}

    </section>
  );
}
