export type WebglSupportReport = {
  supported: boolean;
  reason: string;
};

export function detectWebglSupport(): WebglSupportReport {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      supported: false,
      reason: "client-unavailable",
    };
  }

  const canvas = document.createElement("canvas");
  const context =
    canvas.getContext("webgl2") ??
    canvas.getContext("webgl") ??
    canvas.getContext("experimental-webgl");

  if (!context) {
    return {
      supported: false,
      reason: "webgl-unavailable",
    };
  }

  return {
    supported: true,
    reason: "supported",
  };
}
