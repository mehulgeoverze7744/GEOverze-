import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { Highlight } from "@/components/shared/highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/features/users/format";
import type { QuestionRecord } from "@/features/questions/types";
import { validateQuestion } from "@/features/questions/validation";
import { num } from "@/lib/format";

export function ValidationBadge({ question }: { question: QuestionRecord }) {
  const issues = validateQuestion(question);
  if (issues.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        Valid
      </span>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 text-xs text-warning">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          {issues.length} issue{issues.length > 1 ? "s" : ""}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <ul className="space-y-0.5">
          {issues.map((issue) => (
            <li key={issue.code + issue.field}>{issue.message}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

export function buildQuestionColumns(query: string): DataTableColumn<QuestionRecord>[] {
  return [
    {
      id: "prompt",
      header: "Question",
      accessor: (q) => q.prompt,
      className: "max-w-80",
      cell: (q) => (
        <span className="block max-w-80 truncate font-medium text-foreground">
          <Highlight text={q.prompt} query={query} />
        </span>
      ),
    },
    { id: "type", header: "Type", accessor: (q) => q.type },
    {
      id: "difficulty",
      header: "Difficulty",
      accessor: (q) => q.difficulty,
      cell: (q) => <DifficultyBadge level={q.difficulty} />,
    },
    { id: "category", header: "Category", accessor: (q) => q.category },
    { id: "region", header: "Region", accessor: (q) => q.region },
    { id: "country", header: "Country", accessor: (q) => q.country, defaultHidden: true },
    { id: "topic", header: "Topic", accessor: (q) => q.topic },
    {
      id: "tags",
      header: "Tags",
      accessor: (q) => q.tags.join(", "),
      defaultHidden: true,
      sortable: false,
    },
    { id: "language", header: "Language", accessor: (q) => q.language, defaultHidden: true },
    {
      id: "media",
      header: "Media",
      accessor: (q) => q.mediaLabel || "—",
      defaultHidden: true,
      sortable: false,
    },
    {
      id: "usageCount",
      header: "Usage",
      accessor: (q) => q.usageCount,
      align: "right",
      cell: (q) => num(q.usageCount),
    },
    {
      id: "validation",
      header: "Validation",
      accessor: (q) => validateQuestion(q).length,
      cell: (q) => <ValidationBadge question={q} />,
    },
    {
      id: "status",
      header: "Status",
      accessor: (q) => q.status,
      cell: (q) => <StatusBadge status={q.status} />,
    },
    {
      id: "updatedAt",
      header: "Updated",
      accessor: (q) => q.updatedAt,
      align: "right",
      cell: (q) => formatDate(q.updatedAt),
    },
  ];
}
