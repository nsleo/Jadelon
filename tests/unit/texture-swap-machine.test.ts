import assert from "node:assert/strict";
import test from "node:test";

import {
  appendTextureSwapLog,
} from "../../src/components/globe/texture-swap-machine.ts";
import {
  transitionTextureSwapState,
  type TextureSwapEvent,
} from "../../src/components/globe/texture-swap-machine.ts";
import type { TextureSwapState } from "../../src/components/globe/types.ts";

test("texture swap machine records the full deterministic happy path", () => {
  const events: TextureSwapEvent[] = [
    "request",
    "begin-load",
    "apply-texture",
    "confirm-frame",
  ];
  let currentState: TextureSwapState = "idle";
  let log: TextureSwapState[] = [];

  for (const [index, event] of events.entries()) {
    currentState = transitionTextureSwapState(currentState, event);
    log = appendTextureSwapLog(log, currentState, { reset: index === 0 });
  }

  assert.deepEqual(log, [
    "requested",
    "loading-texture",
    "applying-texture",
    "ready-3d",
  ]);
  assert.equal(currentState, "ready-3d");
});

test("texture swap machine can repeat p55 to p60 to p65 to p55 without leaking the prior sequence", () => {
  const runSwap = () => {
    let currentState: TextureSwapState = "ready-3d";
    let log: TextureSwapState[] = [];

    for (const [index, event] of [
      "request",
      "begin-load",
      "apply-texture",
      "confirm-frame",
    ].entries()) {
      currentState = transitionTextureSwapState(currentState, event as TextureSwapEvent);
      log = appendTextureSwapLog(log, currentState, { reset: index === 0 });
    }

    return { currentState, log };
  };

  const swaps = [runSwap(), runSwap(), runSwap(), runSwap()];

  for (const swap of swaps) {
    assert.equal(swap.currentState, "ready-3d");
    assert.deepEqual(swap.log, [
      "requested",
      "loading-texture",
      "applying-texture",
      "ready-3d",
    ]);
  }
});

test("texture swap machine can fail and recover on the next request", () => {
  let currentState: TextureSwapState = "idle";

  currentState = transitionTextureSwapState(currentState, "request");
  currentState = transitionTextureSwapState(currentState, "fail");
  assert.equal(currentState, "error");

  currentState = transitionTextureSwapState(currentState, "request");
  currentState = transitionTextureSwapState(currentState, "begin-load");
  currentState = transitionTextureSwapState(currentState, "apply-texture");
  currentState = transitionTextureSwapState(currentState, "confirm-frame");
  assert.equal(currentState, "ready-3d");
});
