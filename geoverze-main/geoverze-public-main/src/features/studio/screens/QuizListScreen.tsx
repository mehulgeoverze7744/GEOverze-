import { Link } from "@tanstack/react-router";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { GeoButton } from "@/components/shared/GeoButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { STUDIO_QUIZZES, questionTypeLabel } from "../data/quizzes";
import { categoryLabel } from "../data/creator";
import { STATUS_LABEL, type ContentStatus } from "../data/types";
import { CoverThumb } from "../components/CoverThumb";
import { StatusPill } from "../components/StatusPill";
import { StudioContext } from "../components/StudioContext";
import { StudioHeader, StudioShell } from "../components/StudioShell";
import { StudioPanel } from "../components/StudioPanel";
import { formatNumber, formatPercent, formatRelative } from "../lib/format";

const STATUS_FILTERS: (ContentStatus | "all")[] = [
  "all",
  "draft",
  "in-review",
  "scheduled",
  "published",
  "rejected",
  "archived",
];

/** Quiz Studio index: every set the creator owns, filterable. */
export function QuizListScreen() {
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");

  const quizzes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STUDIO_QUIZZES.filter(
      (quiz) =>
        (status === "all" || quiz.status === status) &&
        (q === "" || quiz.title.toLowerCase().includes(q) || quiz.tags.some((t) => t.includes(q))),
    );
  }, [status, query]);

  return (
    <StudioShell context={<StudioContext tipIndex={1} />}>
      <StudioHeader
        eyebrow="Create"
        title="Quizzes"
        description="Build, review and manage every quiz set you publish into Let's Play."
        actions={
          <GeoButton asChild size="sm" variant="primary" className="gap-2">
            <Link to="/studio/quizzes/new">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
              New quiz
            </Link>
          </GeoButton>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex min-w-[14rem] flex-1 items-center">
          <Search
            className="pointer-events-none absolute left-3 h-4 w-4 text-foreground/50"
            strokeWidth={1.8}
            aria-hidden
          />
          <label htmlFor="quiz-filter" className="sr-only">
            Filter quizzes
          </label>
          <input
            id="quiz-filter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title or tag"
            className="h-9 w-full rounded-lg border border-bronze/15 bg-[oklch(0.175_0.006_60)] pl-9 pr-3 text-[0.8rem] text-foreground outline-none placeholder:text-foreground/50 focus:border-bronze/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.72rem] transition-colors",
                status === s
                  ? "border-bronze/60 bg-bronze/12 text-bronze-glow"
                  : "border-bronze/12 text-foreground/50 hover:border-bronze/30 hover:text-foreground/80",
              )}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-lg border border-bronze/15 p-0.5">
          {(
            [
              { id: "grid" as const, icon: LayoutGrid, label: "Grid view" },
              { id: "table" as const, icon: List, label: "Table view" },
            ] satisfies { id: "grid" | "table"; icon: typeof LayoutGrid; label: string }[]
          ).map((v) => (
            <button
              key={v.id}
              type="button"
              aria-label={v.label}
              aria-pressed={view === v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === v.id ? "bg-bronze/15 text-bronze" : "text-foreground/50",
              )}
            >
              <v.icon className="h-4 w-4" strokeWidth={1.8} />
            </button>
          ))}
        </div>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes match those filters"
          description="Try a different status, or start a new set from scratch."
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 2xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <StudioPanel key={quiz.id} padded={false} className="overflow-hidden">
              <Link to="/studio/quizzes/$quizId" params={{ quizId: quiz.id }} className="block">
                <CoverThumb
                  artKey={quiz.coverKey}
                  label={quiz.title}
                  className="h-32 w-full rounded-none border-0 border-b border-bronze/12"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[0.95rem] font-semibold leading-snug tracking-tight text-foreground">
                      {quiz.title || "Untitled quiz"}
                    </h3>
                    <StatusPill status={quiz.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-[0.78rem] leading-relaxed text-foreground/50">
                    {quiz.description}
                  </p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-bronze/10 pt-3 text-[0.72rem]">
                    <div>
                      <dt className="text-foreground/50">Plays</dt>
                      <dd className="mt-0.5 tabular-nums text-foreground/75">
                        {formatNumber(quiz.plays)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-foreground/50">Completion</dt>
                      <dd className="mt-0.5 tabular-nums text-foreground/75">
                        {formatPercent(quiz.completionRate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-foreground/50">Questions</dt>
                      <dd className="mt-0.5 tabular-nums text-foreground/75">
                        {quiz.questions.length}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-[0.7rem] text-foreground/50">
                    {categoryLabel(quiz.categoryId)} · {quiz.difficulty} · edited{" "}
                    {formatRelative(quiz.updatedAt)}
                  </p>
                </div>
              </Link>
            </StudioPanel>
          ))}
        </div>
      ) : (
        <StudioPanel padded={false} className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-[0.82rem]">
            <thead>
              <tr className="border-b border-bronze/12 text-[0.68rem] uppercase tracking-[0.16em] text-foreground/50">
                <th scope="col" className="px-5 py-3 font-medium">
                  Quiz
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Category
                </th>
                <th scope="col" className="px-3 py-3 text-right font-medium">
                  Questions
                </th>
                <th scope="col" className="px-3 py-3 text-right font-medium">
                  Plays
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Edited
                </th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr
                  key={quiz.id}
                  className="border-b border-bronze/[0.07] transition-colors last:border-0 hover:bg-bronze/[0.04]"
                >
                  <td className="px-5 py-3">
                    <Link
                      to="/studio/quizzes/$quizId"
                      params={{ quizId: quiz.id }}
                      className="font-medium text-foreground/85 hover:text-bronze"
                    >
                      {quiz.title || "Untitled quiz"}
                    </Link>
                    <p className="mt-0.5 text-[0.7rem] text-foreground/50">
                      {quiz.questions[0]
                        ? `Starts with ${questionTypeLabel(quiz.questions[0].type).toLowerCase()}`
                        : "No questions yet"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill status={quiz.status} />
                  </td>
                  <td className="px-3 py-3 text-foreground/55">{categoryLabel(quiz.categoryId)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-foreground/70">
                    {quiz.questions.length}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-foreground/70">
                    {formatNumber(quiz.plays)}
                  </td>
                  <td className="px-5 py-3 text-right text-foreground/50">
                    {formatRelative(quiz.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </StudioPanel>
      )}
    </StudioShell>
  );
}
