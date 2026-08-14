import { Archive, FileEdit, Layers, ListChecks, PlayCircle } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { WidgetState } from "@/components/shared/widget";
import type { QuizStatsSummary } from "@/features/quizzes/data";
import { num } from "@/lib/format";

export function QuizStats({
  summary,
  state = "ready",
}: {
  summary: QuizStatsSummary;
  state?: WidgetState | undefined;
}) {
  return (
    <StatGrid columns={5} label="Quiz catalogue statistics">
      <StatCard
        label="Total quizzes"
        value={num(summary.total)}
        icon={Layers}
        hint={`Avg difficulty ${summary.averageDifficulty}`}
        state={state}
      />
      <StatCard
        label="Published"
        value={num(summary.published)}
        icon={PlayCircle}
        hint={`${num(summary.archived)} archived`}
        state={state}
      />
      <StatCard label="Drafts" value={num(summary.draft)} icon={FileEdit} state={state} />
      <StatCard
        label="Questions used"
        value={num(summary.totalQuestions)}
        icon={ListChecks}
        hint="Across every quiz"
        state={state}
      />
      <StatCard
        label="Most played"
        value={summary.mostPlayed ? num(summary.mostPlayed.plays) : "—"}
        icon={Archive}
        hint={summary.mostPlayed?.title ?? "No data"}
        state={state}
      />
    </StatGrid>
  );
}
