"use client";

import { useLoader } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
} from "react";
import {
  BackSide,
  Color,
  SRGBColorSpace,
  TextureLoader,
} from "three";

import type { GlobeQualityProfile } from "@/components/globe/types";
import type {
  GlobeMaterialMode,
  GlobeTextureReadyPayload,
} from "@/components/globe/types";

type GlobeSurfaceProps = {
  textureChecksum?: string;
  textureId: string;
  textureUrl: string;
  quality: GlobeQualityProfile;
  materialMode: GlobeMaterialMode;
  showGrid: boolean;
  onTextureReady: (payload: GlobeTextureReadyPayload) => void;
};

function buildResolvedTextureUrl(textureUrl: string, textureChecksum?: string) {
  if (!textureChecksum) {
    return textureUrl;
  }

  return `${textureUrl}${textureUrl.includes("?") ? "&" : "?"}v=${textureChecksum}`;
}

export function GlobeSurface({
  textureChecksum,
  textureId,
  textureUrl,
  quality,
  materialMode,
  showGrid,
  onTextureReady,
}: GlobeSurfaceProps) {
  const resolvedTextureUrl = useMemo(
    () => buildResolvedTextureUrl(textureUrl, textureChecksum),
    [textureChecksum, textureUrl],
  );
  const texture = useLoader(TextureLoader, resolvedTextureUrl);
  const configuredTexture = useMemo(() => {
    const nextTexture = texture.clone();
    nextTexture.colorSpace = SRGBColorSpace;
    nextTexture.anisotropy = quality.anisotropy;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [quality.anisotropy, texture]);

  useEffect(() => {
    onTextureReady({
      checksum: textureChecksum,
      resolvedTextureUrl,
      textureId,
      textureUrl,
    });

    return () => {
      configuredTexture.dispose();
    };
  }, [
    configuredTexture,
    onTextureReady,
    resolvedTextureUrl,
    textureChecksum,
    textureId,
    textureUrl,
  ]);

  return (
    <group>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, quality.segments, quality.segments]} />
        {materialMode === "basic" ? (
          <meshBasicMaterial key={resolvedTextureUrl} map={configuredTexture} />
        ) : (
          <meshStandardMaterial
            emissive={new Color("#14302a")}
            emissiveIntensity={0.12}
            key={resolvedTextureUrl}
            map={configuredTexture}
            metalness={0.03}
            roughness={0.94}
          />
        )}
      </mesh>

      {showGrid ? (
        <mesh scale={1.01}>
          <sphereGeometry args={[1, 40, 40]} />
          <meshBasicMaterial
            color="#b18e57"
            opacity={0.08}
            transparent
            wireframe
          />
        </mesh>
      ) : null}

      <mesh scale={1.065}>
        <sphereGeometry args={[1, 40, 40]} />
        <meshBasicMaterial
          color="#6ca994"
          opacity={0.08}
          side={BackSide}
          transparent
        />
      </mesh>
    </group>
  );
}
