import { Highlight } from "@/components/shared/highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import { formatDate } from "@/features/users/format";
import type { BankQuestionRecord } from "@/features/questions/types";
import { num } from "@/lib/format";

export function buildBankQuestionColumns(query: string): DataTableColumn<BankQuestionRecord>[] {
  return [
    {
      id: "prompt",
      header: "Question",
      accessor: (question) => question.prompt,
      className: "max-w-80",
      cell: (question) => (
        <span className="block max-w-80 truncate font-medium text-foreground">
          <Highlight text={question.prompt} query={query} />
        </span>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessor: (question) => question.type,
    },
    {
      id: "quizTitle",
      header: "Quiz",
      accessor: (question) => question.quizTitle,
      cell: (question) => (
        <span className="block max-w-48 truncate text-foreground">{question.quizTitle}</span>
      ),
    },
    {
      id: "position",
      header: "Position",
      accessor: (question) => question.position,
      align: "right",
      cell: (question) => num(question.position),
    },
    {
      id: "quizStatus",
      header: "Quiz status",
      accessor: (question) => (question.quizPublished ? "published" : "draft"),
      cell: (question) => (
        <StatusBadge status={question.quizPublished ? "published" : "draft"} />
      ),
    },
    {
      id: "updatedAt",
      header: "Quiz updated",
      accessor: (question) => question.quizUpdatedAt,
      align: "right",
      cell: (question) => (question.quizUpdatedAt ? formatDate(question.quizUpdatedAt) : "—"),
    },
  ];
}
