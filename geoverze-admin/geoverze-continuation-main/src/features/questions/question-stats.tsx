import { Archive, Database, FileEdit, Gauge, ShieldCheck } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { WidgetState } from "@/components/shared/widget";
import type { QuestionStatsSummary } from "@/features/questions/data";
import { num } from "@/lib/format";

export function QuestionStats({
  summary,
  invalidCount,
  state = "ready",
}: {
  summary: QuestionStatsSummary;
  invalidCount: number;
  state?: WidgetState | undefined;
}) {
  return (
    <StatGrid columns={5} label="Question bank statistics">
      <StatCard
        label="Total questions"
        value={num(summary.total)}
        icon={Database}
        hint="Across every region"
        state={state}
      />
      <StatCard
        label="Published"
        value={num(summary.published)}
        icon={ShieldCheck}
        hint={`${summary.archived} archived`}
        state={state}
      />
      <StatCard label="Drafts" value={num(summary.draft)} icon={FileEdit} state={state} />
      <StatCard
        label="Average usage"
        value={num(summary.averageUsage)}
        icon={Gauge}
        hint="Quizzes per question"
        state={state}
      />
      <StatCard
        label="Needs attention"
        value={num(invalidCount)}
        icon={Archive}
        hint="Failing validation"
        state={state}
      />
    </StatGrid>
  );
}
