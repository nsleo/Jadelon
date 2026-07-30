"use client";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { useRef } from "react";

import type {
  GlobeHotspot,
  GlobeMapAsset,
  GlobeMaterialMode,
  GlobeQualityProfile,
  GlobeRendererInfo,
  GlobeSceneCommand,
  GlobeTelemetry,
  GlobeTextureReadyPayload,
} from "@/components/globe/types";
import { GlobeControls3D } from "@/components/globe/globe-controls-3d";
import { GlobeHotspots } from "@/components/globe/globe-hotspots";
import { GlobeSurface } from "@/components/globe/globe-surface";
import { prototypeGlobeCamera } from "@/lib/globe/prototype-points";

type JadelonGlobeSceneProps = {
  cameraDistance?: number;
  controlsDampingFactor?: number;
  controlsMaxDistance?: number;
  controlsMinDistance?: number;
  controlsRotateSpeed?: number;
  controlsZoomSpeed?: number;
  globeRotation?: readonly [number, number, number];
  globeScale?: number;
  mapAsset: GlobeMapAsset;
  hotspots: GlobeHotspot[];
  selectedHotspotId: string;
  onSelectHotspot: (hotspotId: string) => void;
  onInteractionChange: (active: boolean) => void;
  quality: GlobeQualityProfile;
  reducedMotion: boolean;
  autoRotateEnabled: boolean;
  showGrid: boolean;
  materialMode: GlobeMaterialMode;
  sceneCommand: GlobeSceneCommand;
  onTelemetryChange: (payload: GlobeTelemetry) => void;
  onRendererReady: (payload: GlobeRendererInfo) => void;
  onTextureReady: (payload: GlobeTextureReadyPayload) => void;
  onFirstFrame: () => void;
  onVisibilityChange: (hotspotId: string, visible: boolean) => void;
};

function SceneReadinessProbe({
  onFirstFrame,
  onTelemetryChange,
}: Pick<JadelonGlobeSceneProps, "onFirstFrame" | "onTelemetryChange">) {
  const hasReported = useRef(false);
  const { camera, gl, size } = useThree();

  useFrame(() => {
    if (!hasReported.current) {
      hasReported.current = true;
      onFirstFrame();
    }

    onTelemetryChange({
      azimuthalAngle: 0,
      canvasHeight: size.height,
      canvasWidth: size.width,
      distance: camera.position.length(),
      dpr: gl.getPixelRatio(),
      polarAngle: Math.PI / 2,
    });
  });

  return null;
}

export function JadelonGlobeScene({
  cameraDistance = prototypeGlobeCamera.distance,
  controlsDampingFactor,
  controlsMaxDistance,
  controlsMinDistance,
  controlsRotateSpeed,
  controlsZoomSpeed,
  globeRotation = [0.04, -0.24, 0],
  globeScale = 1.14,
  mapAsset,
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
  onInteractionChange,
  quality,
  reducedMotion,
  autoRotateEnabled,
  showGrid,
  materialMode,
  sceneCommand,
  onTelemetryChange,
  onRendererReady,
  onTextureReady,
  onFirstFrame,
  onVisibilityChange,
}: JadelonGlobeSceneProps) {
  return (
    <div className="globe-scene" data-testid="globe-canvas">
      <Canvas
        camera={{
          far: prototypeGlobeCamera.far,
          fov: prototypeGlobeCamera.fov,
          near: prototypeGlobeCamera.near,
          position: [0, 0, cameraDistance],
        }}
        dpr={[1, quality.dpr]}
        gl={{
          alpha: true,
          antialias: quality.antialias,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl, camera, size }) => {
          const context = gl.getContext();

          onRendererReady({
            antialias: gl.getContextAttributes().antialias ?? false,
            maxTextureSize:
              typeof context.MAX_TEXTURE_SIZE === "number"
                ? context.getParameter(context.MAX_TEXTURE_SIZE)
                : null,
            renderer: String(context.getParameter(context.RENDERER)),
          });

          onTelemetryChange({
            azimuthalAngle: 0,
            canvasHeight: size.height,
            canvasWidth: size.width,
            distance: camera.position.length(),
            dpr: gl.getPixelRatio(),
            polarAngle: Math.PI / 2,
          });
        }}
        shadows={quality.key !== "low"}
      >
        <color attach="background" args={["#0d1112"]} />
        <ambientLight intensity={materialMode === "basic" ? 1 : 1.05} />
        <directionalLight color="#d9c58e" intensity={materialMode === "basic" ? 0 : 1.1} position={[3.8, 3.2, 4.2]} />
        <pointLight color="#5a8e80" intensity={materialMode === "basic" ? 0 : 0.38} position={[-3.2, -1.6, -3]} />
        <SceneReadinessProbe
          onFirstFrame={onFirstFrame}
          onTelemetryChange={onTelemetryChange}
        />
        <GlobeControls3D
          autoRotate={autoRotateEnabled && !reducedMotion}
          autoRotateSpeed={quality.autoRotateSpeed}
          dampingFactor={controlsDampingFactor}
          hotspots={hotspots}
          maxDistance={controlsMaxDistance}
          minDistance={controlsMinDistance}
          onInteractionChange={onInteractionChange}
          onTelemetry={({ azimuthalAngle, polarAngle, distance }) => {
            onTelemetryChange({
              azimuthalAngle,
              canvasHeight: 0,
              canvasWidth: 0,
              distance,
              dpr: quality.dpr,
              polarAngle,
            });
          }}
          reducedMotion={reducedMotion}
          rotateSpeed={controlsRotateSpeed}
          sceneCommand={sceneCommand}
          zoomSpeed={controlsZoomSpeed}
        />
        <group rotation={globeRotation} scale={globeScale}>
          <GlobeSurface
            key={mapAsset.id}
            materialMode={materialMode}
            onTextureReady={onTextureReady}
            quality={quality}
            showGrid={showGrid}
            textureChecksum={mapAsset.checksum}
            textureId={mapAsset.id}
            textureUrl={mapAsset.publicUrl}
          />
          <GlobeHotspots
            hotspots={hotspots}
            onSelectHotspot={onSelectHotspot}
            onVisibilityChange={onVisibilityChange}
            selectedHotspotId={selectedHotspotId}
          />
        </group>
      </Canvas>
      <div aria-hidden="true" className="globe-scene__halo" />
      <div aria-hidden="true" className="globe-scene__frame" />
    </div>
  );
}
