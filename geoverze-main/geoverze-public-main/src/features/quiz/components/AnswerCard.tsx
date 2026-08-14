import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AnswerState = "idle" | "selected" | "correct" | "incorrect" | "muted";

/**
 * The single answer surface for every question type.
 *
 * Solid fill, large touch target, and state expressed with colour *and* an icon
 * plus text so it never relies on colour alone.
 */
export function AnswerCard({
  label,
  state = "idle",
  onClick,
  disabled,
  shortcut,
  media,
  layout = "row",
  className,
}: {
  label: string;
  state?: AnswerState;
  onClick?: () => void;
  disabled?: boolean;
  shortcut?: string;
  media?: ReactNode;
  layout?: "row" | "tile";
  className?: string;
}) {
  const statusLabel =
    state === "correct" ? "Correct answer" : state === "incorrect" ? "Incorrect answer" : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected" || state === "correct" || state === "incorrect"}
      className={cn(
        "group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-[transform,background-color,border-color] motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/60",
        "min-h-[3.75rem] sm:min-h-[4rem]",
        layout === "tile" && "flex-col items-stretch gap-3 p-3 text-center",
        state === "idle" &&
          "border-bronze/14 bg-[oklch(0.185_0.008_62)] text-foreground/85 hover:border-bronze/45 hover:bg-[oklch(0.215_0.01_62)] active:scale-[0.985]",
        state === "selected" && "border-bronze bg-bronze/18 text-bronze-glow",
        state === "correct" &&
          "border-[oklch(0.72_0.13_150/0.7)] bg-[oklch(0.72_0.13_150/0.16)] text-[oklch(0.88_0.12_150)]",
        state === "incorrect" &&
          "border-[oklch(0.66_0.18_20/0.7)] bg-[oklch(0.66_0.18_20/0.16)] text-[oklch(0.84_0.15_25)]",
        state === "muted" && "border-bronze/10 bg-[oklch(0.16_0.006_60)] text-foreground/50",
        disabled && "cursor-default",
        className,
      )}
    >
      {media ? (
        <span className={cn("shrink-0", layout === "tile" && "w-full")}>{media}</span>
      ) : shortcut ? (
        <span
          aria-hidden
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-bronze/25 bg-[oklch(0.13_0.006_60)] text-[0.7rem] font-semibold text-foreground/60"
        >
          {shortcut}
        </span>
      ) : null}

      <span className="flex-1 text-[0.95rem] font-medium leading-snug">{label}</span>

      {state === "correct" ? (
        <Check className="h-5 w-5 shrink-0" strokeWidth={2.2} aria-hidden />
      ) : null}
      {state === "incorrect" ? (
        <X className="h-5 w-5 shrink-0" strokeWidth={2.2} aria-hidden />
      ) : null}
      {statusLabel ? <span className="sr-only">{statusLabel}</span> : null}
    </button>
  );
}
