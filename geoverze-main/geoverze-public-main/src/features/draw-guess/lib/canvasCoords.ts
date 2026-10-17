/** Shared logical drawing surface. All clients map 0–1 coords into this space. */
export const LOGICAL_W = 960;
export const LOGICAL_H = 600;
export const LOGICAL_ASPECT = LOGICAL_W / LOGICAL_H;
export const MAX_DPR = 2.5;

export type NormalizedPoint = { x: number; y: number };

export function normalizeClientPoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): NormalizedPoint | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
  };
}

export function containSize(availW: number, availH: number, aspect = LOGICAL_ASPECT) {
  if (availW <= 0 || availH <= 0) return { w: 0, h: 0 };
  let w = availW;
  let h = w / aspect;
  if (h > availH) {
    h = availH;
    w = h * aspect;
  }
  return { w, h };
}

export function drawingBufferSize(cssW: number, cssH: number, devicePixelRatio: number) {
  const scale = Math.min(Math.max(devicePixelRatio || 1, 1), MAX_DPR);
  return {
    width: Math.max(1, Math.round(cssW * scale)),
    height: Math.max(1, Math.round(cssH * scale)),
    scale,
  };
}
