import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { fetchUsers } from "@/features/users/api";
import { adminKeys } from "@/lib/admin/keys";
import { useAdminQuery } from "@/lib/admin/hooks";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — GVRZE Admin" },
      { name: "description", content: "Configure achievement tiers, criteria and unlock rates." },
      { property: "og:title", content: "Achievements — GVRZE Admin" },
      {
        property: "og:description",
        content: "Configure achievement tiers, criteria and unlock rates.",
      },
    ],
  }),
  component: AchievementsPage,
});

function percent(count: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}

function AchievementsPage() {
  const users = useAdminQuery(adminKeys.users, fetchUsers);
  const list = users.data ?? [];
  const total = list.length;
  const achievements = [
    {
      id: "level-5",
      name: "Level 5",
      criteria: "Reach level 5 in user_progression",
      unlocked: percent(list.filter((user) => user.level >= 5).length, total),
    },
    {
      id: "streak-7",
      name: "Week Streak",
      criteria: "Current streak of 7 or more days",
      unlocked: percent(list.filter((user) => user.currentStreak >= 7).length, total),
    },
    {
      id: "credits-250",
      name: "Credit Collector",
      criteria: "Hold 250 or more GEOcredits",
      unlocked: percent(list.filter((user) => user.credits >= 250).length, total),
    },
    {
      id: "creator",
      name: "Published Creator",
      criteria: "Has the creator role",
      unlocked: percent(list.filter((user) => user.creatorStatus === "Approved").length, total),
    },
  ];

  return (
    <>
      <PageHeader
        title="Achievements"
        description="The public application has no achievement_definitions table. These rates are derived from user_progression and roles."
        actions={
          <Button
            size="sm"
            onClick={() =>
              toast.info("Achievement definitions are not stored in the shared database yet.")
            }
          >
            New achievement
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {achievements.map((item) => (
          <article key={item.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                <Trophy className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold">{item.name}</h2>
                <p className="text-xs text-muted-foreground">{item.criteria}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Unlock rate</span>
                <span className="tabular">{item.unlocked}%</span>
              </div>
              <Progress value={item.unlocked} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
