import { useState } from "react";
import { Trophy } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, PageHeader, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { TournamentCard } from "../components/TournamentCard";
import { TOURNAMENTS, type TournamentStatus } from "../data/tournaments";

const TABS: { id: TournamentStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

/** /play/tournaments — bracket lobby grouped by status. */
export function TournamentsPage() {
  const [tab, setTab] = useState<TournamentStatus | "all">("all");
  const visible = tab === "all" ? TOURNAMENTS : TOURNAMENTS.filter((t) => t.status === tab);

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <PageHeader
          eyebrow="Competitive"
          title="Tournaments"
          description="Open brackets, seasonal cups and invitationals. Brackets are illustrative until competitive play goes live."
        />

        <AnimatedSection className="mt-8">
          <div role="tablist" aria-label="Tournament status" className="flex flex-wrap gap-2">
            {TABS.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={
                    active
                      ? "rounded-xl border border-bronze bg-bronze/20 px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-bronze-glow"
                      : "rounded-xl border border-bronze/20 bg-[oklch(0.185_0.008_62)] px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-foreground/55 transition-colors motion-snap hover:border-bronze/50 hover:text-foreground"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-8">
          {visible.length === 0 ? (
            <div className="game-surface grid place-items-center rounded-2xl p-12 text-center">
              <Trophy className="h-6 w-6 text-bronze" strokeWidth={1.8} aria-hidden />
              <p className="mt-4 text-[0.9rem] text-foreground/60">
                Nothing scheduled in this bracket yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((tournament) => (
                <TournamentCard key={tournament.slug} tournament={tournament} />
              ))}
            </div>
          )}
        </AnimatedSection>

        <AnimatedSection className="mt-10">
          <MetaChip>Placeholder brackets — entries are not processed yet</MetaChip>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
