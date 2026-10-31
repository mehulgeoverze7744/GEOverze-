import { CreditProductAchievementCard } from "@/features/dashboard/components/CreditProductAchievementCard";
import { useCreditProductAchievements } from "@/features/dashboard/hooks/useCreditProductAchievements";

/** Full GeoCredit product achievement history for the signed-in user. */
export function AchievementGrid() {
  const { achievements, loading, error } = useCreditProductAchievements();

  if (loading) {
    return <p className="hr-muted text-sm">Loading achievements…</p>;
  }

  if (error) {
    return <p className="hr-muted text-sm">Unable to load achievements.</p>;
  }

  if (achievements.length === 0) {
    return (
      <div>
        <p className="hr-empty-title">No GeoCredit achievements yet.</p>
        <p className="hr-muted mt-2 text-[0.75rem] leading-relaxed">
          Acquire a GVRZE product with GVRZE Credits to earn your first achievement.
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
