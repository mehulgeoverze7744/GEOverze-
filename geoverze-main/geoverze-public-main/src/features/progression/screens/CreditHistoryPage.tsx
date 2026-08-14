import { useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, EmptyState, SectionContainer, SectionHeading } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { cn } from "@/lib/utils";
import { CreditHistoryCard } from "../components/CreditHistoryCard";
import { CreditRulesCard } from "../components/CreditRulesCard";
import { MonthlyProgressCard } from "../components/MonthlyProgressCard";
import { ProgressionNav } from "../components/ProgressionNav";
import { CREDIT_HISTORY, type CreditReason } from "../data/credits";
import { monthlyCreditTotal } from "../lib/progress";
import { useProgressionStore } from "@/stores/progressionStore";
import { Receipt } from "lucide-react";

const FILTERS: readonly (CreditReason | "All")[] = [
  "All",
  "New Opponent",
  "Second Win",
  "Third Win",
  "Repeated Win",
];

/** /play/credit-history */
export function CreditHistoryPage() {
  const player = useProgressionStore((s) => s.player);
  const [filter, setFilter] = useState<CreditReason | "All">("All");

  const entries =
    filter === "All" ? CREDIT_HISTORY : CREDIT_HISTORY.filter((entry) => entry.reason === filter);
  const total = monthlyCreditTotal(CREDIT_HISTORY);

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Credit history</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Every credit, accounted for
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            A transparent ledger of victories and the credits they awarded this month.
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatedSection>
            <MonthlyProgressCard credits={player.credits} />
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <CreditRulesCard />
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section)]">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Ledger"
            title="Recorded credits"
            description={`${total} credits logged across ${CREDIT_HISTORY.length} entries this month.`}
          />
        </AnimatedSection>

        <AnimatedSection className="mt-7">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors motion-snap",
                  filter === item
                    ? "border-bronze/55 bg-bronze/15 text-bronze-glow"
                    : "border-bronze/15 bg-[oklch(0.185_0.008_62)] text-foreground/55 hover:text-foreground",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </AnimatedSection>

        <div className="mt-6">
          {entries.length === 0 ? (
            <GameCard interactive={false} className="p-8">
              <EmptyState
                icon={Receipt}
                title="No credits in this category yet"
                description="Win duels to start filling the ledger."
              />
            </GameCard>
          ) : (
            <ul className="grid gap-3">
              {entries.map((entry) => (
                <CreditHistoryCard key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      </SectionContainer>
    </PageShell>
  );
}
