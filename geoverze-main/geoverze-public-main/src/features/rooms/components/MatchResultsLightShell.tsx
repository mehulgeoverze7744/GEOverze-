import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const C = {
  page: "bg-[#F3F4F6] text-[#111827]",
  card: "rounded-2xl border border-[#E5E7EB] bg-white shadow-sm",
  muted: "text-[#6B7280]",
  label: "text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#6B7280]",
  title: "text-[#111827]",
  accent: "border-[#111827]/15 bg-[#FAFAFA]",
  youRing: "ring-2 ring-[#111827]/12",
  winnerRing: "ring-2 ring-emerald-500/35",
};

export function MatchResultsLightPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-[100dvh]", C.page, className)}>
      <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-[calc(var(--nav-height)+1.5rem)] sm:px-6">
        {children}
      </div>
    </div>
  );
}

export function MatchResultsHeader({
  eyebrow,
  title,
  description,
  modeLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  modeLabel: string;
}) {
  return (
    <header className="mb-8">
      <p className={C.label}>{eyebrow}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#374151]">
          {modeLabel}
        </span>
        <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-emerald-700">
          Game completed
        </span>
      </div>
      <h1 className="mt-4 text-[clamp(1.65rem,4vw,2.35rem)] font-bold tracking-tight text-[#111827]">
        {title}
      </h1>
      <p className={cn("mt-2 max-w-xl text-[0.92rem] leading-relaxed", C.muted)}>{description}</p>
    </header>
  );
}

export function MatchResultsHeroCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(C.card, "p-6 text-center sm:p-8", className)}>{children}</div>
  );
}

export function MatchResultsLeaderboardCard({
  children,
  highlight,
  winner,
  className,
}: {
  children: ReactNode;
  highlight?: boolean;
  winner?: boolean;
  className?: string;
}) {
  return (
    <li
      className={cn(
        C.card,
        "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        highlight && C.youRing,
        winner && C.winnerRing,
        className,
      )}
    >
      {children}
    </li>
  );
}

export function MatchResultsActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-10 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">{children}</div>
  );
}

export const matchResultsTokens = C;