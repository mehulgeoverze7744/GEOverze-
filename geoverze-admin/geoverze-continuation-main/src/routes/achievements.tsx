import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — GEOverze Admin" },
      { name: "description", content: "Configure achievement tiers, criteria and unlock rates." },
      { property: "og:title", content: "Achievements — GEOverze Admin" },
      {
        property: "og:description",
        content: "Configure achievement tiers, criteria and unlock rates.",
      },
    ],
  }),
  component: AchievementsPage,
});

const achievements = [
  {
    id: "a1",
    name: "First Expedition",
    criteria: "Complete your first quiz",
    unlocked: 92,
    live: true,
  },
  {
    id: "a2",
    name: "Continental Sweep",
    criteria: "Finish a quiz from every continent",
    unlocked: 34,
    live: true,
  },
  {
    id: "a3",
    name: "Cartographer",
    criteria: "Score 100% on 10 map-pin quizzes",
    unlocked: 12,
    live: true,
  },
  { id: "a4", name: "Streak Keeper", criteria: "Play 30 days in a row", unlocked: 8, live: false },
  {
    id: "a5",
    name: "Atlas Author",
    criteria: "Publish 5 quizzes as a creator",
    unlocked: 3,
    live: true,
  },
  {
    id: "a6",
    name: "Deep Field",
    criteria: "Answer 1,000 expert questions",
    unlocked: 2,
    live: false,
  },
];

function AchievementsPage() {
  return (
    <>
      <PageHeader
        title="Achievements"
        description="Badge definitions, unlock criteria and player attainment rates."
        actions={
          <Button
            size="sm"
            onClick={() => toast.info("Achievement editor comes with the backend.")}
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
              <Switch
                defaultChecked={item.live}
                aria-label={`Toggle ${item.name}`}
                onCheckedChange={() => toast.info("Toggle persists after backend integration.")}
              />
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
