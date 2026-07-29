"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Vector3 } from "three";

import type { GlobeHotspot } from "@/components/globe/types";
import {
  isHotspotFacingCamera,
  latLonToVector3,
} from "@/lib/globe/prototype-points";

type GlobeHotspotsProps = {
  hotspots: GlobeHotspot[];
  selectedHotspotId: string;
  onSelectHotspot: (hotspotId: string) => void;
  onVisibilityChange: (hotspotId: string, visible: boolean) => void;
};

function GlobeHotspotMarker({
  hotspot,
  isActive,
  onSelectHotspot,
  onVisibilityChange,
}: {
  hotspot: GlobeHotspot;
  isActive: boolean;
  onSelectHotspot: (hotspotId: string) => void;
  onVisibilityChange: (hotspotId: string, visible: boolean) => void;
}) {
  const position = latLonToVector3(hotspot.latitude, hotspot.longitude, 1.02);
  const [visible, setVisible] = useState(true);

  useFrame(({ camera }) => {
    const nextVisible = isHotspotFacingCamera(position, [
      camera.position.x,
      camera.position.y,
      camera.position.z,
    ]);

    setVisible((current) => (current === nextVisible ? current : nextVisible));
  });

  useEffect(() => {
    onVisibilityChange(hotspot.id, visible);
  }, [hotspot.id, onVisibilityChange, visible]);

  return (
    <group
      position={new Vector3(position[0], position[1], position[2])}
      visible={visible}
      >
        <mesh
          onClick={() => onSelectHotspot(hotspot.id)}
          onPointerDown={() => onSelectHotspot(hotspot.id)}
      >
        <sphereGeometry args={[isActive ? 0.028 : 0.022, 18, 18]} />
        <meshStandardMaterial
          color={isActive ? "#e7d5ab" : "#72b19b"}
          emissive={isActive ? "#b58f58" : "#1d4940"}
          emissiveIntensity={isActive ? 0.58 : 0.34}
        />
      </mesh>
    </group>
  );
}

export function GlobeHotspots({
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
  onVisibilityChange,
}: GlobeHotspotsProps) {
  return (
    <group>
      {hotspots.map((hotspot) => (
        <GlobeHotspotMarker
          hotspot={hotspot}
          isActive={hotspot.id === selectedHotspotId}
          key={hotspot.id}
          onSelectHotspot={onSelectHotspot}
          onVisibilityChange={onVisibilityChange}
        />
      ))}
    </group>
  );
}
