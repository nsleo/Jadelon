import type { TextureSwapState } from "@/components/globe/types";

export type TextureSwapEvent =
  | "reset"
  | "request"
  | "begin-load"
  | "apply-texture"
  | "confirm-frame"
  | "fail";

const textureSwapTransitions: Record<
  TextureSwapState,
  Partial<Record<TextureSwapEvent, TextureSwapState>>
> = {
  "applying-texture": {
    "confirm-frame": "ready-3d",
    fail: "error",
    reset: "idle",
  },
  error: {
    request: "requested",
    reset: "idle",
  },
  idle: {
    request: "requested",
    reset: "idle",
  },
  "loading-texture": {
    "apply-texture": "applying-texture",
    fail: "error",
    reset: "idle",
  },
  "ready-3d": {
    request: "requested",
    reset: "idle",
  },
  requested: {
    "begin-load": "loading-texture",
    fail: "error",
    reset: "idle",
  },
};

export function transitionTextureSwapState(
  currentState: TextureSwapState,
  event: TextureSwapEvent,
) {
  return textureSwapTransitions[currentState][event] ?? currentState;
}

export function appendTextureSwapLog(
  currentLog: TextureSwapState[],
  nextState: TextureSwapState,
  options?: {
    reset?: boolean;
  },
) {
  const base = options?.reset ? [] : currentLog;

  if (base.at(-1) === nextState) {
    return base;
  }

  return [...base, nextState];
}
