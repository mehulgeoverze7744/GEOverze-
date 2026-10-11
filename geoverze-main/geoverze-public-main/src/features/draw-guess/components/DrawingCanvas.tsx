import { useCallback, useEffect, useRef } from "react";

import { submitDrawStroke } from "../data/drawRoomApi";
import { useDrawStrokesRealtime } from "../hooks/useDrawStrokesRealtime";
import type { DrawStroke, DrawStrokePoint } from "../types";

const CANVAS_W = 960;
const CANVAS_H = 600;
const FLUSH_MS = 90;

type PendingGesture = {
  points: DrawStrokePoint[];
  flushedChunkIds: number[];
  color: string;
  size: number;
  tool: "brush" | "eraser";
};

export type DrawingCanvasHandle = {
  clear: () => void;
  undo: () => void;
};

type DrawingCanvasProps = {
  roomId: string;
  turnId: string;
  isDrawer: boolean;
  color: string;
  size: number;
  tool: "brush" | "eraser";
  onReady?: (handle: DrawingCanvasHandle) => void;
};

function drawSegment(
  ctx: CanvasRenderingContext2D,
  points: DrawStrokePoint[],
  color: string,
  size: number,
  tool: "brush" | "eraser",
) {
  if (points.length === 0) return;
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = color;
  ctx.lineWidth = size;

  if (points.length === 1) {
    const p = points[0];
    if (!p) return;
    ctx.beginPath();
    ctx.arc(p.x * CANVAS_W, p.y * CANVAS_H, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  const first = points[0];
  if (!first) { ctx.restore(); return; }
  ctx.moveTo(first.x * CANVAS_W, first.y * CANVAS_H);
  for (let i = 1; i < points.length; i += 1) {
    const pt = points[i];
    if (!pt) continue;
    ctx.lineTo(pt.x * CANVAS_W, pt.y * CANVAS_H);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Real-time drawing surface. The active drawer paints locally and streams
 * small point-chunks to the server (server-validated, rate + size limited);
 * every other client replays the authoritative `draw_strokes` stream.
 * Keyed by `turnId` from the parent so a brand-new turn always mounts a
 * fresh, blank canvas.
 */
export function DrawingCanvas({ roomId, turnId, isDrawer, color, size, tool, onReady }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const strokesRef = useRef<DrawStroke[]>([]);
  const removedIdsRef = useRef<Set<number>>(new Set());
  const gestureRef = useRef<PendingGesture | null>(null);
  const flushTimerRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const gestureHistoryRef = useRef<number[][]>([]); // committed gesture chunk-id groups, oldest -> newest

  const getPos = useCallback((event: PointerEvent): DrawStrokePoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
  }, []);

  const redrawAll = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    for (const stroke of strokesRef.current) {
      if (stroke.kind !== "stroke") continue;
      if (removedIdsRef.current.has(stroke.id)) continue;
      const points = Array.isArray(stroke.points) ? stroke.points : [];
      drawSegment(ctx, points, stroke.color ?? "#caa36a", stroke.size ?? 6, stroke.tool ?? "brush");
    }
  }, []);

  const applyIncomingStroke = useCallback(
    (stroke: DrawStroke) => {
      if (stroke.kind === "clear") {
        strokesRef.current = [];
        removedIdsRef.current = new Set();
        gestureHistoryRef.current = [];
        const ctx = ctxRef.current;
        if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        return;
      }

      if (stroke.kind === "undo") {
        const payload = stroke.points as { remove_ids?: number[] } | null;
        for (const id of payload?.remove_ids ?? []) {
          removedIdsRef.current.add(id);
        }
        redrawAll();
        return;
      }

      strokesRef.current.push(stroke);
      if (!removedIdsRef.current.has(stroke.id)) {
        const ctx = ctxRef.current;
        if (ctx) {
          const points = Array.isArray(stroke.points) ? stroke.points : [];
          drawSegment(ctx, points, stroke.color ?? "#caa36a", stroke.size ?? 6, stroke.tool ?? "brush");
        }
      }
    },
    [redrawAll],
  );

  // Non-drawers (and the drawer on reconnect) replay the authoritative stream.
  useDrawStrokesRealtime(turnId, applyIncomingStroke);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    strokesRef.current = [];
    removedIdsRef.current = new Set();
    gestureHistoryRef.current = [];
    gestureRef.current = null;
  }, [turnId]);

  const flushGesture = useCallback(
    (final: boolean) => {
      const gesture = gestureRef.current;
      if (!gesture || gesture.points.length === 0) return;

      const chunk = gesture.points;
      gesture.points = [];

      void submitDrawStroke({
        roomId,
        turnId,
        kind: "stroke",
        points: chunk,
        color: gesture.color,
        size: gesture.size,
        tool: gesture.tool,
      })
        .then((id) => {
          gesture.flushedChunkIds.push(id);
        })
        .catch(() => undefined);

      if (final) {
        if (gesture.flushedChunkIds.length > 0) {
          gestureHistoryRef.current.push(gesture.flushedChunkIds);
        }
      }
    },
    [roomId, turnId],
  );

  const startGesture = useCallback(
    (point: DrawStrokePoint) => {
      gestureRef.current = {
        points: [point],
        flushedChunkIds: [],
        color: tool === "eraser" ? "#000000" : color,
        size,
        tool,
      };
      // Render the first point locally immediately for zero-latency feedback.
      const ctx = ctxRef.current;
      if (ctx) drawSegment(ctx, [point], tool === "eraser" ? "#000000" : color, size, tool);

      flushTimerRef.current = window.setInterval(() => flushGesture(false), FLUSH_MS);
    },
    [color, size, tool, flushGesture],
  );

  const extendGesture = useCallback((point: DrawStrokePoint) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    const last = gesture.points[gesture.points.length - 1];
    gesture.points.push(point);
    const ctx = ctxRef.current;
    if (ctx && last) {
      drawSegment(ctx, [last, point], gesture.color, gesture.size, gesture.tool);
    }
  }, []);

  const endGesture = useCallback(() => {
    if (flushTimerRef.current !== null) {
      window.clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    flushGesture(true);
    gestureRef.current = null;
  }, [flushGesture]);

  useEffect(() => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDown = (event: PointerEvent) => {
      if (pointerIdRef.current !== null) return;
      pointerIdRef.current = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
      const point = getPos(event);
      if (point) startGesture(point);
    };

    const handleMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;
      const point = getPos(event);
      if (point) extendGesture(point);
    };

    const handleUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;
      pointerIdRef.current = null;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // ignore — pointer capture may already be released
      }
      endGesture();
    };

    canvas.addEventListener("pointerdown", handleDown);
    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerup", handleUp);
    canvas.addEventListener("pointercancel", handleUp);
    canvas.addEventListener("pointerleave", handleUp);

    return () => {
      canvas.removeEventListener("pointerdown", handleDown);
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointercancel", handleUp);
      canvas.removeEventListener("pointerleave", handleUp);
      if (flushTimerRef.current !== null) {
        window.clearInterval(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    };
  }, [isDrawer, getPos, startGesture, extendGesture, endGesture]);

  const clear = useCallback(() => {
    strokesRef.current = [];
    removedIdsRef.current = new Set();
    gestureHistoryRef.current = [];
    const ctx = ctxRef.current;
    if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    void submitDrawStroke({ roomId, turnId, kind: "clear" }).catch(() => undefined);
  }, [roomId, turnId]);

  const undo = useCallback(() => {
    const lastGesture = gestureHistoryRef.current.pop();
    if (!lastGesture || lastGesture.length === 0) return;
    for (const id of lastGesture) removedIdsRef.current.add(id);
    redrawAll();
    void submitDrawStroke({
      roomId,
      turnId,
      kind: "undo",
      points: { remove_ids: lastGesture },
    }).catch(() => undefined);
  }, [roomId, turnId, redrawAll]);

  useEffect(() => {
    onReady?.({ clear, undo });
  }, [onReady, clear, undo]);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-bronze/25 bg-[oklch(0.97_0.004_80)]">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="h-full w-full touch-none select-none"
        style={{ cursor: isDrawer ? "crosshair" : "default" }}
        aria-label={isDrawer ? "Drawing canvas" : "Shared drawing — spectator view"}
      />
      {!isDrawer ? (
        <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-bronze/30 bg-[oklch(0.12_0.006_60/0.72)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground/60">
          Watching
        </span>
      ) : null}
    </div>
  );
}
