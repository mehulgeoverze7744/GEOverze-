import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";

import { AchievementsStrip } from "./AchievementsStrip";
import { ContinuePlayingCard } from "./ContinuePlayingCard";
import { DashboardCommandActions } from "./DashboardCommandActions";
import { DashboardGeostoreCard } from "./DashboardGeostoreCard";
import { DashboardLeaderboardCard } from "./DashboardLeaderboardCard";
import { DashboardNotificationsCard } from "./DashboardNotificationsCard";
import { DashboardProfileShortcut } from "./DashboardProfileShortcut";
import { GeoCreditsModule } from "./GeoCreditsModule";
import { QuizProgressCard } from "./QuizProgressCard";
import { RecentQuizzesPanel } from "./RecentQuizzesPanel";
import { RecentlyViewedPanel } from "./RecentlyViewedPanel";
import { SavedExplorationsPanel } from "./SavedExplorationsPanel";
import { SubscriptionCard } from "./SubscriptionCard";
import { UpcomingEventsPanel } from "./UpcomingEventsPanel";

/** Dashboard widget mosaic — progress, history, recommendations and account. */
export function DashboardWidgets() {
  return (
    <div className="contents">
      <SectionContainer
        size="dashboard"
        className="dashboard-order-actions mt-[var(--space-section-sm)]"
      >
        <div className="dashboard-dock-row">
          <AnimatedSection className="min-h-0 h-full">
            <DashboardCommandActions className="h-full" />
          </AnimatedSection>
          <AnimatedSection delay={40} className="min-h-0 h-full">
            <DashboardNotificationsCard className="h-full" />
          </AnimatedSection>
          <AnimatedSection delay={80} className="min-h-0 h-full">
            <DashboardProfileShortcut className="h-full" />
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer
        size="dashboard"
        className="dashboard-order-command mt-[var(--space-section-sm)]"
      >
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <AnimatedSection className="min-h-0 h-full">
            <ContinuePlayingCard className="h-full" />
          </AnimatedSection>
          <AnimatedSection delay={60} className="min-h-0 h-full">
            <QuizProgressCard className="h-full" />
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer
        size="dashboard"
        className="dashboard-order-progress mt-[var(--space-section-sm)]"
      >
        <div className="dashboard-progress-row grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:items-stretch">
          <AnimatedSection className="min-h-0 h-full">
            <AchievementsStrip className="h-full" />
          </AnimatedSection>
          <AnimatedSection delay={60} className="min-h-0 h-full">
            <RecentQuizzesPanel className="h-full" />
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="dashboard-order-viewed mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatedSection>
            <RecentlyViewedPanel className="h-full" />
          </AnimatedSection>
          <AnimatedSection delay={60}>
            <SavedExplorationsPanel className="h-full" />
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="dashboard-order-rewards mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <AnimatedSection className="min-h-0 h-full">
            <GeoCreditsModule className="h-full" />
          </AnimatedSection>
          <AnimatedSection delay={60} className="min-h-0 h-full">
            <SubscriptionCard className="h-full" />
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="dashboard-order-store mt-[var(--space-section-sm)]">
        <div className="dashboard-store-row">
          <AnimatedSection className="min-h-0 min-w-0 h-full">
            <DashboardLeaderboardCard className="h-full" />
          </AnimatedSection>
          <AnimatedSection delay={60} className="min-h-0 min-w-0 h-full">
            <DashboardGeostoreCard className="h-full" />
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="dashboard-order-upcoming mt-[var(--space-section-sm)] pb-[var(--space-section-sm)]">
        <AnimatedSection>
          <UpcomingEventsPanel />
        </AnimatedSection>
      </SectionContainer>
    </div>
  );
}
