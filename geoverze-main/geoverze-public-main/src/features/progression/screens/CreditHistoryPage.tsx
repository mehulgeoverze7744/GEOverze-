import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Loader2, Lock, Receipt } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  SectionContainer,
  SectionHeading,
} from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { MetaChip } from "@/features/play/components/Badges";
import { cn } from "@/lib/utils";
import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

import { CreditBalanceSummary } from "../components/CreditBalanceSummary";
import { CreditExpiryNotice } from "../components/CreditExpiryNotice";
import { CreditHistoryCard } from "../components/CreditHistoryCard";
import { CreditRulesCard } from "../components/CreditRulesCard";
import { MonthlyProgressCard } from "../components/MonthlyProgressCard";
import { ProgressionNav } from "../components/ProgressionNav";
import { CREDIT_HISTORY_FILTERS, type CreditHistoryFilter } from "../data/credits";
import { useCreditHistory } from "../hooks/useCreditHistory";
import { filterLedgerEntries } from "../lib/mapCreditLedgerEntry";

/** /play/credit-history */
export function CreditHistoryPage() {
  const signedIn = useAuthStore(selectIsSignedIn);
  const authStatus = useAuthStore((s) => s.status);
  const authReady = authStatus !== "unknown";
  const [filter, setFilter] = useState<CreditHistoryFilter>("All");
  const { entries, expiringLots, monthlyEarned, loading, error } = useCreditHistory();

  const filtered = filterLedgerEntries(entries, filter);
  const earnedCount = entries.filter((entry) => entry.direction === "earned").length;
  const spentCount = entries.filter((entry) => entry.direction === "spent").length;

  if (authReady && !signedIn) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]">
          <AnimatedSection className="mx-auto max-w-xl text-center">
            <MetaChip tone="bronze">
              <Lock className="h-3 w-3" strokeWidth={2.2} aria-hidden />
              Credit history
            </MetaChip>
            <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-foreground">
              Sign in to view your credits
            </h1>
            <p className="mt-4 text-[0.9rem] leading-relaxed text-foreground/60">
              Your wallet balance, earn history, GEOstore spending, and upcoming expiry dates are
              tied to your account.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <GeoButton variant="solid" size="lg" asChild>
                <Link to="/auth/login">Sign in</Link>
              </GeoButton>
              <GeoButton variant="dark" size="lg" asChild>
                <Link to="/geostore/rewards">Browse rewards</Link>
              </GeoButton>
            </div>
          </AnimatedSection>
        </SectionContainer>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Credit history</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Every credit, accounted for
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            Your full credit ledger — gameplay earns, GEOstore spending, and upcoming expiry dates.
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatedSection>
            <CreditBalanceSummary />
          </AnimatedSection>
          <AnimatedSection delay={40}>
            <MonthlyProgressCard monthlyEarned={monthlyEarned} />
          </AnimatedSection>
        </div>
      </SectionContainer>

      {expiringLots.length > 0 ? (
        <SectionContainer className="mt-4">
          <AnimatedSection delay={60}>
            <CreditExpiryNotice lots={expiringLots} />
          </AnimatedSection>
        </SectionContainer>
      ) : null}

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection delay={80}>
          <CreditRulesCard />
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section)]">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Ledger"
            title="Credit history"
            description={
              loading
                ? "Loading your ledger…"
                : `${entries.length} entries · ${earnedCount} earned · ${spentCount} spent`
            }
          />
        </AnimatedSection>

        <AnimatedSection className="mt-7">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {CREDIT_HISTORY_FILTERS.map((item) => (
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
          {loading ? (
            <GameCard interactive={false} className="p-8">
              <EmptyState
                icon={Loader2}
                title="Loading credit history"
                description="Fetching your ledger from the server."
              />
            </GameCard>
          ) : error ? (
            <GameCard interactive={false} className="p-8">
              <EmptyState
                icon={AlertCircle}
                title="Could not load credit history"
                description={error}
              />
            </GameCard>
          ) : filtered.length === 0 ? (
            <GameCard interactive={false} className="p-8">
              <EmptyState
                icon={Receipt}
                title={
                  filter === "All"
                    ? "No credit activity yet"
                    : `No ${filter.toLowerCase()} entries yet`
                }
                description={
                  filter === "All"
                    ? "Win duels or claim GEOstore rewards to start filling the ledger."
                    : "Try another filter or earn credits through gameplay."
                }
              />
            </GameCard>
          ) : (
            <ul className="grid gap-3">
              {filtered.map((entry) => (
                <CreditHistoryCard key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      </SectionContainer>
    </PageShell>
  );
}
