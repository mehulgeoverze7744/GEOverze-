import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

import { useHistoryRewardsSummary } from "../lib/useHistoryRewardsSummary";

/** Compact overview metrics for the unified page header. */
export function StatsSummary() {
  const summary = useHistoryRewardsSummary();

  return (
    <div className="hr-summary" aria-label="Activity summary">
      <div className="hr-stat">
        <p className="hr-stat-value">
          <AnimatedCounter value={summary.quizzesCompleted} />
        </p>
        <p className="hr-stat-label">Quizzes</p>
      </div>
      <div className="hr-stat">
        <p className="hr-stat-value hr-stat-value--accent">{summary.accuracy}%</p>
        <p className="hr-stat-label">Accuracy</p>
      </div>
      <div className="hr-stat">
        <p className="hr-stat-value">
          <AnimatedCounter value={summary.wins} />
        </p>
        <p className="hr-stat-label">Wins</p>
      </div>
      <div className="hr-stat">
        <p className="hr-stat-value">
          <AnimatedCounter value={summary.creditsEarned} />
        </p>
        <p className="hr-stat-label">Credits</p>
      </div>
      <div className="hr-stat">
        <p className="hr-stat-value">
          {summary.badgesUnlocked}
          <span className="text-foreground/35"> / {summary.badgesTotal}</span>
        </p>
        <p className="hr-stat-label">Badges</p>
      </div>
    </div>
  );
}
