import { BadgeCheck, Clock, Star, Users } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { WidgetState } from "@/components/shared/widget";
import type { CreatorStatsSummary } from "@/features/creators/data";
import { num } from "@/lib/format";

export function CreatorStats({
  summary,
  state = "ready",
}: {
  summary: CreatorStatsSummary;
  state?: WidgetState | undefined;
}) {
  return (
    <StatGrid label="Creator overview statistics">
      <StatCard
        label="Total creators"
        value={num(summary.total)}
        delta={summary.monthlyGrowth}
        hint="Joined in the last 30 days"
        icon={Users}
        state={state}
      />
      <StatCard
        label="Verified creators"
        value={num(summary.verified)}
        hint={`${summary.pending} awaiting review`}
        icon={BadgeCheck}
        state={state}
      />
      <StatCard
        label="Active this month"
        value={num(summary.active)}
        hint={`${num(summary.inactive)} inactive`}
        icon={Clock}
        state={state}
      />
      <StatCard
        label="Average rating"
        value={summary.averageRating.toFixed(1)}
        hint={`${num(summary.publishedQuizzes)} published quizzes`}
        icon={Star}
        state={state}
      />
    </StatGrid>
  );
}
