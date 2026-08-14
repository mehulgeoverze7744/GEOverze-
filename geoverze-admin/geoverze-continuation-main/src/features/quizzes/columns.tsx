import { Star } from "lucide-react";

import type { DataTableColumn } from "@/components/shared/data-table";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { Highlight } from "@/components/shared/highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/features/users/format";
import type { QuizRecord } from "@/features/quizzes/types";
import { num } from "@/lib/format";

export function buildQuizColumns(query: string): DataTableColumn<QuizRecord>[] {
  return [
    {
      id: "title",
      header: "Quiz",
      accessor: (q) => q.title,
      className: "max-w-72",
      cell: (q) => (
        <div className="max-w-72">
          <span className="block truncate font-medium text-foreground">
            <Highlight text={q.title} query={query} />
          </span>
          <span className="block truncate text-xs text-muted-foreground">{q.id}</span>
        </div>
      ),
    },
    {
      id: "creator",
      header: "Creator",
      accessor: (q) => q.creator,
      cell: (q) => <Highlight text={q.creator} query={query} />,
    },
    { id: "category", header: "Category", accessor: (q) => q.category },
    {
      id: "difficulty",
      header: "Difficulty",
      accessor: (q) => q.difficulty,
      cell: (q) => <DifficultyBadge level={q.difficulty} />,
    },
    {
      id: "questionCount",
      header: "Questions",
      accessor: (q) => q.questionCount,
      align: "right",
    },
    {
      id: "duration",
      header: "Duration",
      accessor: (q) => q.durationMinutes,
      align: "right",
      cell: (q) => `${q.durationMinutes} min`,
    },
    {
      id: "status",
      header: "Status",
      accessor: (q) => q.status,
      cell: (q) => <StatusBadge status={q.status} />,
    },
    {
      id: "visibility",
      header: "Visibility",
      accessor: (q) => q.visibility,
      cell: (q) => (
        <Badge variant="outline" className="text-xs font-normal">
          {q.visibility}
        </Badge>
      ),
    },
    { id: "language", header: "Language", accessor: (q) => q.language, defaultHidden: true },
    {
      id: "plays",
      header: "Plays",
      accessor: (q) => q.plays,
      align: "right",
      cell: (q) => num(q.plays),
    },
    {
      id: "completionRate",
      header: "Completion",
      accessor: (q) => q.completionRate,
      align: "right",
      cell: (q) => `${q.completionRate}%`,
    },
    {
      id: "averageScore",
      header: "Avg score",
      accessor: (q) => q.averageScore,
      align: "right",
      defaultHidden: true,
      cell: (q) => `${q.averageScore}%`,
    },
    {
      id: "rating",
      header: "Rating",
      accessor: (q) => q.rating,
      align: "right",
      cell: (q) => (
        <span className="inline-flex items-center justify-end gap-1 tabular">
          <Star className="size-3.5 text-warning" aria-hidden="true" />
          {q.rating.toFixed(1)}
          <span className="text-xs text-muted-foreground">({num(q.ratingCount)})</span>
        </span>
      ),
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
