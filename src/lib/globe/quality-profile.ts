import type {
  GlobeQualityKey,
  GlobeQualityProfile,
} from "@/components/globe/types";

export const globeQualityProfiles: Record<GlobeQualityKey, GlobeQualityProfile> = {
  low: {
    key: "low",
    label: "Baixa",
    dpr: 1,
    segments: 56,
    anisotropy: 2,
    antialias: false,
    autoRotateSpeed: 0.28,
  },
  medium: {
    key: "medium",
    label: "Media",
    dpr: 1.5,
    segments: 72,
    anisotropy: 4,
    antialias: true,
    autoRotateSpeed: 0.24,
  },
  high: {
    key: "high",
    label: "Alta",
    dpr: 2,
    segments: 88,
    anisotropy: 8,
    antialias: true,
    autoRotateSpeed: 0.2,
  },
};

export function getGlobeQualityProfile(key: GlobeQualityKey) {
  return globeQualityProfiles[key];
}
