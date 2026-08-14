import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { History, Repeat2, Search } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, PageHeader, SectionContainer, StatCard } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { MATCHES, MATCH_MODE_LABEL, MATCH_OUTCOME_LABEL, type MatchMode } from "../data/matches";

const FILTERS: { id: MatchMode | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "solo", label: "Solo" },
  { id: "pvp", label: "PvP" },
  { id: "multiplayer", label: "Multiplayer" },
  { id: "daily", label: "Daily" },
  { id: "practice", label: "Practice" },
];

const relative = (iso: string) => {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const duration = (sec: number) => `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, "0")}s`;

/** /play/history — match log with summary stats and per-mode filtering. */
export function HistoryPage() {
  const [filter, setFilter] = useState<MatchMode | "all">("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return MATCHES.filter(
      (m) =>
        (filter === "all" || m.mode === filter) &&
        (term === "" ||
          m.quizTitle.toLowerCase().includes(term) ||
          (m.opponent ?? "").toLowerCase().includes(term)),
    );
  }, [filter, query]);

  const summary = useMemo(() => {
    const played = MATCHES.length;
    const wins = MATCHES.filter((m) => m.outcome === "win").length;
    const accuracy = Math.round(
      MATCHES.reduce((sum, m) => sum + m.accuracy, 0) / Math.max(1, played),
    );
    const xp = MATCHES.reduce((sum, m) => sum + m.xp, 0);
    return { played, wins, accuracy, xp };
  }, []);

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <PageHeader
          eyebrow="Your record"
          title="Match history"
          description="Every completed run with score, timing and rewards. Replays reconstruct the board from the stored answers."
        />

        <AnimatedSection className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Matches played" value={String(summary.played)} />
          <StatCard label="Wins" value={String(summary.wins)} />
          <StatCard label="Avg accuracy" value={`${summary.accuracy}%`} />
          <StatCard label="XP earned" value={summary.xp.toLocaleString()} />
        </AnimatedSection>

        <AnimatedSection className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.id)}
                  className={
                    active
                      ? "rounded-xl border border-bronze bg-bronze/20 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-bronze-glow"
                      : "rounded-xl border border-bronze/20 bg-[oklch(0.185_0.008_62)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-foreground/55 transition-colors motion-snap hover:border-bronze/50 hover:text-foreground"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <label className="game-surface flex min-w-0 items-center gap-2 rounded-xl px-3 py-2 lg:w-72">
            <Search className="h-4 w-4 shrink-0 text-foreground/50" strokeWidth={2} aria-hidden />
            <span className="sr-only">Search match history</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quiz or opponent"
              className="min-w-0 flex-1 bg-transparent text-[0.85rem] text-foreground outline-none placeholder:text-foreground/50"
            />
          </label>
        </AnimatedSection>

        <AnimatedSection className="mt-6">
          {rows.length === 0 ? (
            <div className="game-surface grid place-items-center rounded-2xl p-12 text-center">
              <History className="h-6 w-6 text-bronze" strokeWidth={1.8} aria-hidden />
              <p className="mt-4 text-[0.9rem] text-foreground/60">No matches match that filter.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {rows.map((match) => (
                <li key={match.id} className="game-surface rounded-2xl p-4 sm:p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <MetaChip>{MATCH_MODE_LABEL[match.mode]}</MetaChip>
                        <MetaChip tone={match.outcome === "win" ? "bronze" : "muted"}>
                          {MATCH_OUTCOME_LABEL[match.outcome]}
                        </MetaChip>
                        <span className="text-[0.7rem] text-foreground/50">
                          {relative(match.playedAt)}
                        </span>
                      </div>
                      <h2 className="mt-2 truncate text-[0.95rem] font-semibold tracking-tight text-foreground">
                        {match.quizTitle}
                      </h2>
                      <p className="mt-1 text-[0.75rem] text-foreground/50">
                        {match.opponent
                          ? `vs ${match.opponentFlag ?? ""} ${match.opponent}`
                          : "Solo run"}{" "}
                        · {duration(match.durationSec)} · +{match.xp} XP · +{match.credits} credits
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[1.15rem] font-semibold tabular-nums text-foreground">
                        {match.score}
                        <span className="text-foreground/50">/{match.total}</span>
                      </p>
                      <p className="text-[0.7rem] tabular-nums text-foreground/50">
                        {match.accuracy}% accuracy
                      </p>
                      <Link
                        to="/play/history/$matchId"
                        params={{ matchId: match.id }}
                        className="mt-3 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-bronze transition-colors motion-snap hover:text-bronze-glow"
                      >
                        <Repeat2 className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
                        Replay
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
