import { ImageOff, MapPin } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { QuizQuestion } from "../../data/types";
import { calibrateMapRegions, resolveMapBoard } from "../../lib/mapBoards";
import type { QuestionViewProps } from "../questionView";

type Q = Extract<QuizQuestion, { type: "map" }>;
type LoadStatus = "loading" | "ready" | "error";

type ImageBox = { left: number; top: number; width: number; height: number };

function MapUnavailable({ label }: { label: string }) {
  return (
    <div
      className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-6 text-center text-[#94A3B8]"
      role="alert"
    >
      <ImageOff className="h-6 w-6" strokeWidth={1.8} aria-hidden />
      <p className="text-[0.82rem] font-medium text-[#64748B]">{label}</p>
      <p className="text-[0.72rem] leading-relaxed">
        The geographic map for this question could not be loaded.
      </p>
    </div>
  );
}

/**
 * Map selection: pin one of several hotspots on a real regional map.
 * Pins sit on the loaded image box (object-contain), not the letterboxed card.
 */
export function MapSelectQuestion({ question, value, locked, onSelect }: QuestionViewProps<Q>) {
  const selected = value?.[0];
  const mediaArt =
    question.media && "art" in question.media ? question.media.art : null;
  const resolved = useMemo(
    () =>
      resolveMapBoard({
        boardArt: question.boardArt,
        mediaArt,
        prompt: question.prompt,
        caption: question.media && "caption" in question.media ? question.media.caption : null,
        regions: question.regions,
      }),
    [mediaArt, question.boardArt, question.media, question.prompt, question.regions],
  );
  const src = resolved?.src ?? null;
  const alt = resolved?.label ?? "Geographic map";
  const regions = useMemo(
    () => calibrateMapRegions(question.boardArt, question.regions, question.prompt),
    [question.boardArt, question.prompt, question.regions],
  );

  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<LoadStatus>(src ? "loading" : "error");
  const [box, setBox] = useState<ImageBox | null>(null);

  useEffect(() => {
    setBox(null);
    setStatus(src ? "loading" : "error");
  }, [src]);

  useEffect(() => {
    const img = imgRef.current;
    if (!src || !img) return;
    if (img.complete && img.naturalWidth > 0) setStatus("ready");
  }, [src]);

  useLayoutEffect(() => {
    if (status !== "ready") return;
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;

    const update = () => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (!nw || !nh) return;
      const pw = frame.clientWidth;
      const ph = frame.clientHeight;
      const scale = Math.min(pw / nw, ph / nh);
      const width = nw * scale;
      const height = nh * scale;
      setBox({
        left: (pw - width) / 2,
        top: (ph - height) / 2,
        width,
        height,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [status, src]);

  const pinsEnabled = status === "ready" && box !== null && !locked;

  if (!src || status === "error") {
    return (
      <div>
        <MapUnavailable label={alt} />
        <RegionLegend regions={regions} selected={selected} locked={locked} answerId={question.answerId} />
      </div>
    );
  }

  return (
    <div>
      <div
        ref={frameRef}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#d7e6f4]"
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-contain object-center",
            status !== "ready" && "opacity-0",
          )}
          onLoad={() => setStatus("ready")}
          onError={() => {
            setBox(null);
            setStatus("error");
          }}
        />

        {status === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#d7e6f4]">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#2b74c4]/30 border-t-[#2b74c4]" />
            <p className="text-[0.75rem] font-medium text-[#64748B]">Loading map…</p>
          </div>
        ) : null}

        {status === "ready" && box ? (
          <div
            className="absolute"
            style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
            role="group"
            aria-label="Map locations"
          >
            {regions.map((region) => {
              const isSelected = selected === region.id;
              const isAnswer = region.id === question.answerId;
              const tone = !locked
                ? isSelected
                  ? "border-[#2b74c4] bg-[#2b74c4] text-white"
                  : "border-white bg-white/90 text-[#1e4d86] hover:bg-[#2b74c4] hover:text-white"
                : isAnswer
                  ? "border-emerald-600 bg-emerald-500 text-white"
                  : isSelected
                    ? "border-rose-600 bg-rose-500 text-white"
                    : "border-white/70 bg-white/70 text-[#64748B]";

              return (
                <button
                  key={region.id}
                  type="button"
                  disabled={!pinsEnabled}
                  onClick={() => onSelect([region.id])}
                  aria-label={region.label}
                  aria-pressed={isSelected}
                  style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  className={cn(
                    "absolute inline-flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-md transition-all motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b74c4]/70 active:scale-95",
                    tone,
                    !pinsEnabled && !locked && "cursor-wait opacity-60",
                  )}
                >
                  <MapPin className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <RegionLegend regions={regions} selected={selected} locked={locked} answerId={question.answerId} />
    </div>
  );
}

function RegionLegend({
  regions,
  selected,
  locked,
  answerId,
}: {
  regions: Q["regions"];
  selected: string | undefined;
  locked: boolean;
  answerId: string;
}) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {regions.map((region) => (
        <li
          key={region.id}
          className={cn(
            "rounded-full border px-3 py-1.5 text-[0.72rem] font-medium",
            locked && region.id === answerId
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : selected === region.id
                ? "border-[#2b74c4] bg-[#2b74c4]/10 text-[#1e4d86]"
                : "border-[#E2E8F0] text-[#64748B]",
          )}
        >
          {region.label}
        </li>
      ))}
    </ul>
  );
}
