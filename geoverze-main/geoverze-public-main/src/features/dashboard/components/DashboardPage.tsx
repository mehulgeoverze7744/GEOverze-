import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";

import "../styles/dashboard.css";

import { DashboardHero } from "./DashboardHero";
import { DashboardWidgets } from "./DashboardWidgets";
import { StreakTracker } from "./StreakTracker";

/**
 * Logged-in explorer command centre.
 *
 * Content is placeholder until the quiz engine reports real telemetry; the
 * identity block is genuine and reads from the session, onboarding and profile
 * stores through `useProfile`.
 */
export function DashboardPage() {
  return (
    <PageShell>
      <div className="dashboard-layout">
        <SectionContainer
          size="dashboard"
          className="dashboard-order-hero pt-[calc(var(--nav-height)+var(--space-section-sm))]"
        >
          <AnimatedSection>
            <DashboardHero />
          </AnimatedSection>
        </SectionContainer>

        <SectionContainer size="dashboard" className="dashboard-order-streak">
          <AnimatedSection>
            <StreakTracker />
          </AnimatedSection>
        </SectionContainer>

        <DashboardWidgets />
      </div>
    </PageShell>
  );
}
