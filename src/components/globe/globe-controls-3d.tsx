"use client";

import { OrbitControls } from "@react-three/drei";
import type { ElementRef } from "react";
import {
  useEffect,
  useRef,
} from "react";
import { useFrame } from "@react-three/fiber";
import { Spherical, Vector3 } from "three";

import type {
  GlobeHotspot,
  GlobeSceneCommand,
} from "@/components/globe/types";
import {
  getOrbitAnglesForHotspot,
  prototypeGlobeCamera,
} from "@/lib/globe/prototype-points";

type GlobeControls3DProps = {
  autoRotate: boolean;
  autoRotateSpeed: number;
  dampingFactor?: number;
  maxDistance?: number;
  minDistance?: number;
  onInteractionChange: (active: boolean) => void;
  hotspots: GlobeHotspot[];
  sceneCommand: GlobeSceneCommand;
  reducedMotion: boolean;
  rotateSpeed?: number;
  onTelemetry: (payload: {
    azimuthalAngle: number;
    polarAngle: number;
    distance: number;
  }) => void;
  zoomSpeed?: number;
};

export function GlobeControls3D({
  autoRotate,
  autoRotateSpeed,
  dampingFactor = 0.08,
  maxDistance = prototypeGlobeCamera.maxDistance,
  minDistance = prototypeGlobeCamera.minDistance,
  onInteractionChange,
  hotspots,
  sceneCommand,
  reducedMotion,
  rotateSpeed = 0.65,
  onTelemetry,
  zoomSpeed = 0.72,
}: GlobeControls3DProps) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls> | null>(null);
  const targetAngles = useRef<{ azimuthalAngle: number; polarAngle: number } | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls || sceneCommand.type === "none") {
      return;
    }

    if (sceneCommand.type === "rotate-quarter") {
      targetAngles.current = {
        azimuthalAngle: controls.getAzimuthalAngle() + Math.PI / 2,
        polarAngle: controls.getPolarAngle(),
      };
      return;
    }

    if (sceneCommand.type === "set-view-preset") {
      const viewPresets = {
        back: { azimuthalAngle: Math.PI, polarAngle: Math.PI / 2 },
        front: { azimuthalAngle: 0, polarAngle: Math.PI / 2 },
        left: { azimuthalAngle: Math.PI / 2, polarAngle: Math.PI / 2 },
        north: { azimuthalAngle: 0, polarAngle: 1.08 },
        right: { azimuthalAngle: -Math.PI / 2, polarAngle: Math.PI / 2 },
        south: { azimuthalAngle: 0, polarAngle: 2.06 },
      } as const;

      const preset = viewPresets[sceneCommand.preset];

      if (sceneCommand.instant || reducedMotion) {
        const spherical = new Spherical(
          controls.getDistance(),
          preset.polarAngle,
          preset.azimuthalAngle,
        );
        const nextPosition = new Vector3().setFromSpherical(spherical);
        controls.object.position.copy(nextPosition);
        controls.update();
        targetAngles.current = null;
        return;
      }

      targetAngles.current = preset;
      return;
    }

    const hotspot = hotspots.find((entry) => entry.id === sceneCommand.hotspotId);

    if (!hotspot) {
      return;
    }

    const orbitAngles = getOrbitAnglesForHotspot(hotspot.latitude, hotspot.longitude);

    if (sceneCommand.instant || reducedMotion) {
      const spherical = new Spherical(
        controls.getDistance(),
        orbitAngles.polarAngle,
        orbitAngles.azimuthalAngle,
      );
      const nextPosition = new Vector3().setFromSpherical(spherical);
      controls.object.position.copy(nextPosition);
      controls.update();
      targetAngles.current = null;
      return;
    }

    targetAngles.current = orbitAngles;
  }, [hotspots, reducedMotion, sceneCommand]);

  useFrame(() => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    if (targetAngles.current) {
      const nextAzimuth =
        controls.getAzimuthalAngle() +
        (targetAngles.current.azimuthalAngle - controls.getAzimuthalAngle()) * 0.1;
      const nextPolar =
        controls.getPolarAngle() +
        (targetAngles.current.polarAngle - controls.getPolarAngle()) * 0.1;
      const spherical = new Spherical(controls.getDistance(), nextPolar, nextAzimuth);
      const nextPosition = new Vector3().setFromSpherical(spherical);

      controls.object.position.copy(nextPosition);
      controls.update();

      if (
        Math.abs(targetAngles.current.azimuthalAngle - nextAzimuth) < 0.01 &&
        Math.abs(targetAngles.current.polarAngle - nextPolar) < 0.01
      ) {
        targetAngles.current = null;
      }
    }

    onTelemetry({
      azimuthalAngle: controls.getAzimuthalAngle(),
      polarAngle: controls.getPolarAngle(),
      distance: controls.getDistance(),
    });
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      dampingFactor={dampingFactor}
      enableDamping
      enablePan={false}
      enableZoom
      makeDefault
      maxDistance={maxDistance}
      maxPolarAngle={prototypeGlobeCamera.maxPolarAngle}
      minDistance={minDistance}
      minPolarAngle={prototypeGlobeCamera.minPolarAngle}
      onEnd={() => onInteractionChange(false)}
      onStart={() => onInteractionChange(true)}
      rotateSpeed={rotateSpeed}
      zoomSpeed={zoomSpeed}
    />
  );
}
