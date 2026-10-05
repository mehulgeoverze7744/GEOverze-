import { CreditProductAchievementCard } from "@/features/dashboard/components/CreditProductAchievementCard";
import { useCreditProductAchievements } from "@/features/dashboard/hooks/useCreditProductAchievements";

/** Full GeoCredit product achievement history for the signed-in user. */
export function AchievementGrid() {
  const { achievements, loading, error } = useCreditProductAchievements();

  if (loading) {
    return <p className="text-sm text-foreground/45">Loading achievements…</p>;
  }

  if (error) {
    return <p className="text-sm text-foreground/45">Unable to load achievements.</p>;
  }

  if (achievements.length === 0) {
    return (
      <div>
        <p className="text-sm text-foreground/80">No GeoCredit achievements yet.</p>
        <p className="mt-2 text-[0.75rem] leading-relaxed text-foreground/50">
          Acquire a GEOverze product with GeoCredits to earn your first achievement.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="hr-achievement-summary-count mb-6">
        {achievements.length} GeoCredit {achievements.length === 1 ? "achievement" : "achievements"}
      </p>
      <div className="hr-achievement-grid">
        {achievements.map((achievement) => (
          <CreditProductAchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
