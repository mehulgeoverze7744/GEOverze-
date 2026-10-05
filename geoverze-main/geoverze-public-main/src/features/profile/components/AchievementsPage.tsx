import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { CreditProductAchievementCard } from "@/features/dashboard/components/CreditProductAchievementCard";
import { useCreditProductAchievements } from "@/features/dashboard/hooks/useCreditProductAchievements";

/** GeoCredit product achievement history. */
export function AchievementsPage() {
  const { achievements, loading, error } = useCreditProductAchievements();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Achievements"
        title="GeoCredit acquisitions"
        description="Products you have acquired with GeoCredits."
      />
      <SectionContainer size="default" className="max-w-[78rem] pb-[var(--space-section-sm)]">
        <AnimatedSection>
          {loading ? (
            <p className="text-sm text-foreground/45">Loading achievements…</p>
          ) : error ? (
            <p className="text-sm text-foreground/45">Unable to load achievements.</p>
          ) : achievements.length === 0 ? (
            <div>
              <p className="text-sm text-foreground/80">No GeoCredit achievements yet.</p>
              <p className="mt-2 text-[0.75rem] leading-relaxed text-foreground/50">
                Acquire a GEOverze product with GeoCredits to earn your first achievement.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {achievements.map((achievement) => (
                <li key={achievement.id}>
                  <CreditProductAchievementCard achievement={achievement} />
                </li>
              ))}
            </ul>
          )}
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
