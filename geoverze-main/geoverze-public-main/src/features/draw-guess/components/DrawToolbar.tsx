import { RotateCcw, Trash2 } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { cn } from "@/lib/utils";

const PALETTE = [
  "#1a1a1a", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
  "#0ea5e9", "#14b8a6", "#84cc16", "#f59e0b", "#caa36a",
];

const SIZES = [4, 8, 14, 22] as const;

type DrawToolbarProps = {
  color: string;
  size: number;
  tool: "brush" | "eraser";
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onToolChange: (tool: "brush" | "eraser") => void;
  onUndo: () => void;
  onClear: () => void;
};

export function DrawToolbar({
  color, size, tool, onColorChange, onSizeChange, onToolChange, onUndo, onClear,
}: DrawToolbarProps) {
  const handleClear = () => {
    if (window.confirm("Clear the entire canvas? This cannot be undone.")) {
      onClear();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-bronze/20 bg-[oklch(0.12_0.006_60/0.7)] px-4 py-3">
      {/* Colour palette */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Colour palette">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Select colour ${c}`}
            aria-pressed={color === c && tool === "brush"}
            onClick={() => { onColorChange(c); onToolChange("brush"); }}
            className={cn(
              "h-6 w-6 flex-shrink-0 rounded-full border-2 transition-transform hover:scale-110 motion-reduce:hover:scale-100",
              color === c && tool === "brush"
                ? "border-white scale-110"
                : "border-transparent",
            )}
            style={{ background: c, boxShadow: c === "#ffffff" ? "inset 0 0 0 1px rgba(0,0,0,.3)" : undefined }}
          />
        ))}
      </div>

      <div className="h-6 w-px bg-bronze/20" aria-hidden />

      {/* Brush size */}
      <div className="flex items-center gap-1.5" role="group" aria-label="Brush size">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Size ${s}`}
            aria-pressed={size === s}
            onClick={() => onSizeChange(s)}
            className={cn(
              "flex items-center justify-center rounded-full transition-all",
              size === s ? "bg-bronze/30 border border-bronze/60" : "hover:bg-bronze/15",
              s <= 6 ? "h-6 w-6" : s <= 10 ? "h-7 w-7" : s <= 16 ? "h-8 w-8" : "h-9 w-9",
            )}
          >
            <span
              className="rounded-full bg-current"
              style={{ width: s * 0.7, height: s * 0.7, background: color }}
            />
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-bronze/20" aria-hidden />

      {/* Eraser toggle */}
      <button
        type="button"
        aria-pressed={tool === "eraser"}
        onClick={() => onToolChange(tool === "eraser" ? "brush" : "eraser")}
        className={cn(
          "rounded-xl border px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-all",
          tool === "eraser"
            ? "border-bronze bg-bronze/20 text-bronze-glow"
            : "border-bronze/25 bg-transparent text-foreground/60 hover:border-bronze/50",
        )}
      >
        Eraser
      </button>

      <div className="ml-auto flex gap-2">
        <GeoButton variant="ghost" size="sm" onClick={onUndo} title="Undo last stroke">
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
          Undo
        </GeoButton>
        <GeoButton variant="ghost" size="sm" onClick={handleClear} title="Clear canvas">
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          Clear
        </GeoButton>
      </div>
    </div>
  );
}
