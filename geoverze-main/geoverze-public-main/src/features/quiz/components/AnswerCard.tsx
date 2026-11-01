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
        "group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-[transform,background-color,border-color] motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b74c4]/40",
        "min-h-[3.75rem] sm:min-h-[4rem]",
        layout === "tile" && "flex-col items-stretch gap-3 p-3 text-center",
        state === "idle" &&
          "border-[#E2E8F0] bg-[#F8FAFC] text-[#111827] hover:border-[#2b74c4]/45 hover:bg-[#FFFFFF] active:scale-[0.985]",
        state === "selected" && "border-[#2b74c4] bg-[#2b74c4]/10 text-[#1e4d86]",
        state === "correct" && "border-emerald-300 bg-emerald-50 text-emerald-800",
        state === "incorrect" && "border-rose-300 bg-rose-50 text-rose-800",
        state === "muted" && "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]",
        disabled && "cursor-default",
        className,
      )}
    >
      {media ? (
        <span className={cn("shrink-0", layout === "tile" && "w-full")}>{media}</span>
      ) : shortcut ? (
        <span
          aria-hidden
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[0.7rem] font-semibold text-[#64748B]"
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
