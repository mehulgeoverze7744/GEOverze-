import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";

import { AchievementsStrip } from "./AchievementsStrip";
import { FavouriteCategoriesPanel } from "./FavouriteCategoriesPanel";
import { GeoCreditsModule } from "./GeoCreditsModule";
import { LearningProgressPanel } from "./LearningProgressPanel";
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

      <SectionContainer className="dashboard-order-learning mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-3">
          <AnimatedSection className="dashboard-order-learning lg:col-span-2">
            <LearningProgressPanel />
          </AnimatedSection>
          <AnimatedSection delay={60} className="dashboard-order-learning">
            <FavouriteCategoriesPanel />
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="dashboard-order-viewed mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatedSection>
            <RecentlyViewedPanel />
          </AnimatedSection>
          <AnimatedSection delay={60}>
            <SavedExplorationsPanel />
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="dashboard-order-rewards mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatedSection>
            <GeoCreditsModule />
          </AnimatedSection>
          <AnimatedSection delay={60}>
            <SubscriptionCard />
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
