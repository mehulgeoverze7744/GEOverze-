import { useCallback, useEffect, useRef, useState } from "react";

import { submitDrawStroke } from "../data/drawRoomApi";
import { useDrawStrokesRealtime } from "../hooks/useDrawStrokesRealtime";
import {
  containSize,
  drawingBufferSize,
  LOGICAL_ASPECT,
  LOGICAL_H,
  LOGICAL_W,
  normalizeClientPoint,
} from "../lib/canvasCoords";
import type { DrawStroke, DrawStrokePoint } from "../types";

const FLUSH_MS = 48;
const PAPER = "oklch(0.97 0.004 80)";

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
  turnId: string | undefined;
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
    if (!p) {
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.arc(p.x * LOGICAL_W, p.y * LOGICAL_H, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  const first = points[0];
  if (!first) {
    ctx.restore();
    return;
  }
  ctx.moveTo(first.x * LOGICAL_W, first.y * LOGICAL_H);
  for (let i = 1; i < points.length; i += 1) {
    const pt = points[i];
    if (!pt) continue;
    ctx.lineTo(pt.x * LOGICAL_W, pt.y * LOGICAL_H);
  }
  ctx.stroke();
  ctx.restore();
}

function fillPaper(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

/**
 * Shared drawing surface. Pointer coords are normalized 0–1 in a 16:10 logical
 * space; the bitmap is scaled by devicePixelRatio so strokes stay sharp.
 */
export function DrawingCanvas({
  roomId,
  turnId,
  isDrawer,
  color,
  size,
  tool,
  onReady,
}: DrawingCanvasProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const strokesRef = useRef<DrawStroke[]>([]);
  const appliedIdsRef = useRef<Set<number>>(new Set());
  const removedIdsRef = useRef<Set<number>>(new Set());
  const gestureRef = useRef<PendingGesture | null>(null);
  const flushTimerRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const gestureHistoryRef = useRef<number[][]>([]);
  const replayingRef = useRef(false);
  const [frame, setFrame] = useState({ w: 0, h: 0 });

  const getPos = useCallback((event: PointerEvent): DrawStrokePoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return normalizeClientPoint(event.clientX, event.clientY, canvas.getBoundingClientRect());
  }, []);

  const configureBuffer = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const buffer = drawingBufferSize(rect.width, rect.height, window.devicePixelRatio || 1);
    if (canvas.width !== buffer.width || canvas.height !== buffer.height) {
      canvas.width = buffer.width;
      canvas.height = buffer.height;
    }
    ctx.setTransform(buffer.width / LOGICAL_W, 0, 0, buffer.height / LOGICAL_H, 0, 0);
  }, []);

  const redrawAll = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    configureBuffer();
    fillPaper(ctx);
    configureBuffer();
    for (const stroke of strokesRef.current) {
      if (stroke.kind !== "stroke") continue;
      if (removedIdsRef.current.has(stroke.id)) continue;
      const points = Array.isArray(stroke.points) ? stroke.points : [];
      drawSegment(ctx, points, stroke.color ?? "#caa36a", stroke.size ?? 6, stroke.tool ?? "brush");
    }
  }, [configureBuffer]);

  const applyIncomingStroke = useCallback(
    (stroke: DrawStroke) => {
      if (stroke.kind === "clear") {
        strokesRef.current = [];
        appliedIdsRef.current = new Set();
        removedIdsRef.current = new Set();
        gestureHistoryRef.current = [];
        const ctx = ctxRef.current;
        if (ctx) {
          fillPaper(ctx);
          configureBuffer();
        }
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

      if (appliedIdsRef.current.has(stroke.id)) return;
      appliedIdsRef.current.add(stroke.id);
      strokesRef.current.push(stroke);
      if (isDrawer) return;
      if (removedIdsRef.current.has(stroke.id)) return;

      const ctx = ctxRef.current;
      if (!ctx) return;
      const points = Array.isArray(stroke.points) ? stroke.points : [];
      drawSegment(ctx, points, stroke.color ?? "#caa36a", stroke.size ?? 6, stroke.tool ?? "brush");
    },
    [configureBuffer, isDrawer, redrawAll],
  );

  const onRemoteStroke = useCallback(
    (stroke: DrawStroke) => {
      applyIncomingStroke(stroke);
    },
    [applyIncomingStroke],
  );

  useDrawStrokesRealtime(turnId, onRemoteStroke, {
    onReplayStart: () => {
      replayingRef.current = true;
    },
    onReplayEnd: () => {
      replayingRef.current = false;
      if (!isDrawer || !gestureRef.current) redrawAll();
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }
    ctxRef.current = ctx;
    strokesRef.current = [];
    appliedIdsRef.current = new Set();
    removedIdsRef.current = new Set();
    gestureHistoryRef.current = [];
    gestureRef.current = null;
    configureBuffer();
    if (ctx) {
      fillPaper(ctx);
      configureBuffer();
    }
  }, [turnId, configureBuffer]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const aw = stage.clientWidth;
      const ah = stage.clientHeight;
      if (aw <= 0 || ah <= 0) return;
      const next = containSize(aw, ah);
      setFrame((prev) => (prev.w === next.w && prev.h === next.h ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    window.addEventListener("orientationchange", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  useEffect(() => {
    if (frame.w <= 0) return;
    configureBuffer();
    redrawAll();
  }, [frame, configureBuffer, redrawAll]);

  const flushGesture = useCallback(
    (final: boolean) => {
      const gesture = gestureRef.current;
      if (!turnId || !gesture || gesture.points.length === 0) return;

      const chunk = gesture.points;
      gesture.points = final ? [] : [chunk[chunk.length - 1]!];

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
          appliedIdsRef.current.add(id);
        })
        .catch(() => undefined);
    },
    [roomId, turnId],
  );

  const startGesture = useCallback(
    (point: DrawStrokePoint) => {
      const paintColor = tool === "eraser" ? "#000000" : color;
      gestureRef.current = {
        points: [point],
        flushedChunkIds: [],
        color: paintColor,
        size,
        tool,
      };
      const ctx = ctxRef.current;
      if (ctx) drawSegment(ctx, [point], paintColor, size, tool);
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
    const gesture = gestureRef.current;
    flushGesture(true);
    if (gesture) {
      window.setTimeout(() => {
        if (gesture.flushedChunkIds.length > 0) {
          gestureHistoryRef.current.push([...gesture.flushedChunkIds]);
        }
      }, 120);
    }
    gestureRef.current = null;
  }, [flushGesture]);

  useEffect(() => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDown = (event: PointerEvent) => {
      if (pointerIdRef.current !== null) return;
      event.preventDefault();
      pointerIdRef.current = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
      const point = getPos(event);
      if (point) startGesture(point);
    };

    const handleMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;
      event.preventDefault();
      const point = getPos(event);
      if (point) extendGesture(point);
    };

    const handleUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;
      pointerIdRef.current = null;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // already released
      }
      endGesture();
    };

    canvas.addEventListener("pointerdown", handleDown);
    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerup", handleUp);
    canvas.addEventListener("pointercancel", handleUp);

    return () => {
      canvas.removeEventListener("pointerdown", handleDown);
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointercancel", handleUp);
      if (flushTimerRef.current !== null) {
        window.clearInterval(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    };
  }, [isDrawer, getPos, startGesture, extendGesture, endGesture]);

  const clear = useCallback(() => {
    strokesRef.current = [];
    appliedIdsRef.current = new Set();
    removedIdsRef.current = new Set();
    gestureHistoryRef.current = [];
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      fillPaper(ctx);
      configureBuffer();
    }
    if (turnId) void submitDrawStroke({ roomId, turnId, kind: "clear" }).catch(() => undefined);
  }, [roomId, turnId, configureBuffer]);

  const undo = useCallback(() => {
    const lastGesture = gestureHistoryRef.current.pop();
    if (!lastGesture || lastGesture.length === 0) return;
    for (const id of lastGesture) removedIdsRef.current.add(id);
    redrawAll();
    if (turnId) {
      void submitDrawStroke({
        roomId,
        turnId,
        kind: "undo",
        points: { remove_ids: lastGesture },
      }).catch(() => undefined);
    }
  }, [roomId, turnId, redrawAll]);

  useEffect(() => {
    onReady?.({ clear, undo });
  }, [onReady, clear, undo]);

  return (
    <div
      ref={stageRef}
      className="relative flex min-h-[min(58vh,34rem)] w-full flex-1 items-center justify-center lg:min-h-0"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-bronze/25 bg-[oklch(0.97_0.004_80)] shadow-[0_12px_40px_oklch(0_0_0/0.28)]"
        style={
          frame.w > 0
            ? { width: frame.w, height: frame.h }
            : { width: "100%", aspectRatio: `${LOGICAL_W} / ${LOGICAL_H}` }
        }
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none select-none"
          style={{ cursor: isDrawer ? "crosshair" : "default", touchAction: "none" }}
          aria-label={isDrawer ? "Drawing canvas" : "Shared drawing — spectator view"}
        />
        {!isDrawer ? (
          <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-bronze/30 bg-[oklch(0.12_0.006_60/0.72)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground/60">
            Watching
          </span>
        ) : null}
      </div>
    </div>
  );
}
