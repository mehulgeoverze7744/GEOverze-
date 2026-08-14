/** Cheap, cached WebGL capability probe. Browser-only — call after mount. */
let cached: boolean | null = null;

export function hasWebGLSupport(): boolean {
  if (cached !== null) return cached;
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    cached = Boolean(
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl"),
    );
  } catch {
    cached = false;
  }
  return cached;
}
