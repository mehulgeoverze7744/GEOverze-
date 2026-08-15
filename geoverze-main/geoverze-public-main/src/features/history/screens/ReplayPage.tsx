import { Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock, Repeat2, X } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer, StatCard } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { useQuizSet } from "@/features/quiz";
import { MATCHES, MATCH_MODE_LABEL, MATCH_OUTCOME_LABEL } from "../data/matches";

/** /play/history/$matchId — question-by-question replay of a stored match. */
export function ReplayPage() {
  const { matchId } = useParams({ from: "/play/history/$matchId" });
  // Locale timestamps only render after hydration to keep SSR output stable.
  const [playedLabel, setPlayedLabel] = useState("");
  const match = MATCHES.find((m) => m.id === matchId);

  // useQuizSet must be called unconditionally (Rules of Hooks).
  // When match is undefined the hook receives undefined and returns loading=false, error set.
  const { set, loading: setLoading } = useQuizSet(match?.quizId);

  useEffect(() => {
    if (match) setPlayedLabel(new Date(match.playedAt).toLocaleString());
  }, [match]);

  if (!match) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)] text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Replay unavailable
          </h1>
          <p className="mt-3 text-[0.9rem] text-foreground/55">
            This match is no longer in your history.
          </p>
          <GeoButton asChild variant="solid" size="md" className="mt-6">
            <Link to="/play/history">Back to history</Link>
          </GeoButton>
        </SectionContainer>
      </PageShell>
    );
  }

  if (setLoading || !set) {
    return (
      <PageShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent text-bronze"
            aria-label="Loading replay…"
          />
        </div>
      </PageShell>
    );
  }

  const correctCount = Math.round((match.accuracy / 100) * set.questions.length);

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/history"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Match history
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <MetaChip tone="bronze">
              <Repeat2 className="h-3 w-3" strokeWidth={2.2} aria-hidden />
              Replay
            </MetaChip>
            <MetaChip>{MATCH_MODE_LABEL[match.mode]}</MetaChip>
            <MetaChip tone={match.outcome === "win" ? "bronze" : "muted"}>
              {MATCH_OUTCOME_LABEL[match.outcome]}
            </MetaChip>
          </div>
          <h1 className="mt-4 text-[clamp(1.7rem,4vw,2.5rem)] font-semibold leading-[1.08] tracking-tight text-foreground">
            {match.quizTitle}
          </h1>
          <p className="mt-3 text-[0.9rem] text-foreground/60">
            {match.opponent ? `Played against ${match.opponent}` : "Solo run"} · {playedLabel}
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Score" value={`${match.score}/${match.total}`} />
          <StatCard label="Accuracy" value={`${match.accuracy}%`} />
          <StatCard
            label="Duration"
            value={`${Math.floor(match.durationSec / 60)}m ${match.durationSec % 60}s`}
          />
          <StatCard label="Rewards" value={`+${match.xp} XP`} />
        </AnimatedSection>

        <AnimatedSection className="mt-10">
          <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
            Question timeline
          </h2>
          <ol className="mt-4 space-y-3">
            {set.questions.map((question, index) => {
              const correct = index < correctCount;
              return (
                <li key={question.id} className="game-surface rounded-2xl p-4 sm:p-5">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4">
                    <span
                      className={
                        correct
                          ? "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-bronze/50 bg-bronze/20 text-bronze-glow"
                          : "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-bronze/15 bg-[oklch(0.185_0.008_62)] text-foreground/50"
                      }
                    >
                      {correct ? (
                        <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                      ) : (
                        <X className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                      )}
                      <span className="sr-only">{correct ? "Answered correctly" : "Missed"}</span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.7rem] uppercase tracking-[0.16em] text-foreground/50">
                        Question {index + 1}
                      </p>
                      <p className="mt-1.5 text-[0.9rem] leading-relaxed text-foreground/80">
                        {question.prompt}
                      </p>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-[0.72rem] tabular-nums text-foreground/50">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      {correct ? 14 : 20}s
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-6 text-[0.75rem] text-foreground/50">
            Replays reconstruct the board from placeholder data until match recording ships.
          </p>
          <GeoButton asChild variant="solid" size="lg" className="mt-6">
            <Link to="/play/quiz" search={{ quiz: set.id }}>
              Play this set again
            </Link>
          </GeoButton>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
