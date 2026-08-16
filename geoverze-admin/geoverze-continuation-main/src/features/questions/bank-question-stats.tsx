import { Database, FileEdit, Layers, ShieldCheck } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { WidgetState } from "@/components/shared/widget";
import type { BankQuestionStatsSummary } from "@/features/questions/bank-stats";
import { num } from "@/lib/format";

export function BankQuestionStats({
  summary,
  state = "ready",
}: {
  summary: BankQuestionStatsSummary;
  state?: WidgetState | undefined;
}) {
  return (
    <StatGrid columns={4} label="Question bank statistics">
      <StatCard
        label="Total questions"
        value={num(summary.total)}
        icon={Database}
        hint="All quiz-scoped rows"
        state={state}
      />
      <StatCard
        label="In published quizzes"
        value={num(summary.publishedQuizQuestions)}
        icon={ShieldCheck}
        hint="Live on the public app when quiz is published"
        state={state}
      />
      <StatCard
        label="In draft quizzes"
        value={num(summary.draftQuizQuestions)}
        icon={FileEdit}
        state={state}
      />
      <StatCard
        label="Parent quizzes"
        value={num(summary.uniqueQuizzes)}
        icon={Layers}
        hint="Distinct quizzes represented"
        state={state}
      />
    </StatGrid>
  );
}
