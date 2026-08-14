import { Link } from "@tanstack/react-router";
import { Home, ListChecks, RotateCcw, Share2, Sparkles } from "lucide-react";
import { useState } from "react";

import { AnimatedCounter, GeoButton, ProgressRing } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { cn } from "@/lib/utils";
import type { QuizSet } from "../data/types";
import { formatDuration, type RunSummary } from "../lib/session";
import { Confetti } from "./Confetti";
import { QuizLayout } from "./QuizLayout";

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="game-surface-raised rounded-xl px-4 py-3 text-center">
      <p
        className={cn(
          "text-[1.15rem] font-semibold tabular-nums",
          tone === "good" && "text-[oklch(0.86_0.12_150)]",
          tone === "bad" && "text-[oklch(0.84_0.15_25)]",
          !tone && "text-foreground",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground/50">
        {label}
      </p>
    </div>
  );
}

/** End-of-run summary: score, accuracy, rewards and what to do next. */
export function ResultSummary({
  set,
  summary,
  onPlayAgain,
  reviewSearch,
}: {
  set: QuizSet;
  summary: RunSummary;
  onPlayAgain: () => void;
  reviewSearch: { quiz: string };
}) {
  const [shared, setShared] = useState(false);
  const pct = Math.round(summary.accuracy * 100);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(
        `I scored ${summary.correct}/${summary.total} on "${set.title}" in GEOverze.`,
      );
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch {
      setShared(false);
    }
  };

  return (
    <QuizLayout width="default" className="pt-10">
      <section className="game-surface relative overflow-hidden rounded-2xl p-6 sm:p-8">
        {pct >= 75 ? <Confetti /> : null}
        <div className="relative flex flex-col items-center text-center">
          <MetaChip tone="bronze">{set.title}</MetaChip>
          <div className="mt-5">
            <ProgressRing value={pct} size={132} label="Accuracy">
              <span className="text-[1.4rem] font-semibold tabular-nums text-foreground">
                {pct}%
              </span>
            </ProgressRing>
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {summary.rating.label}
          </h1>
          <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-foreground/60">
            {summary.rating.blurb}
          </p>
          <p className="mt-4 text-[1.05rem] font-semibold text-foreground">
            <AnimatedCounter value={summary.correct} /> / {summary.total} correct
          </p>
        </div>

        <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Correct" value={String(summary.correct)} tone="good" />
          <Stat label="Wrong" value={String(summary.wrong)} tone="bad" />
          <Stat label="Skipped" value={String(summary.skipped)} />
          <Stat label="Time" value={formatDuration(summary.durationMs)} />
          <Stat label="Score" value={String(summary.score)} />
          <Stat label="Best streak" value={String(summary.bestStreak)} />
          <Stat label="XP earned" value={`+${summary.xp}`} />
          <Stat label="Credits" value={`+${summary.credits}`} />
        </div>

        <p className="relative mt-4 flex items-center justify-center gap-2 text-[0.72rem] text-foreground/50">
          <Sparkles className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} aria-hidden />
          XP, credits and streaks are placeholders until progression is connected.
        </p>

        <div className="relative mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <GeoButton variant="solid" size="lg" onClick={onPlayAgain}>
            <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden />
            Play again
          </GeoButton>
          <GeoButton variant="dark" size="lg" asChild>
            <Link to="/play/quiz/review" search={reviewSearch}>
              <ListChecks className="h-4 w-4" strokeWidth={1.9} aria-hidden />
              Review answers
            </Link>
          </GeoButton>
          <GeoButton variant="ghost" size="lg" onClick={share}>
            <Share2 className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            {shared ? "Copied" : "Share result"}
          </GeoButton>
          <GeoButton variant="ghost" size="lg" asChild>
            <Link to="/play">
              <Home className="h-4 w-4" strokeWidth={1.9} aria-hidden />
              Back to hub
            </Link>
          </GeoButton>
        </div>
        <p aria-live="polite" className="sr-only">
          {shared ? "Result copied to clipboard" : ""}
        </p>
      </section>
    </QuizLayout>
  );
}
