import { Link } from "@tanstack/react-router";

import { GeoButton } from "@/components/shared/GeoButton";
import {
  MODE_LABEL,
  RESULT_LABEL,
  formatDate,
  type QuizRun,
} from "@/features/history/data/history";
import { cn } from "@/lib/utils";

const RESULT_CLASS: Record<QuizRun["result"], string> = {
  win: "hr-result--win",
  loss: "hr-result--loss",
  complete: "hr-result--complete",
};

function HistoryTableRow({ run }: { run: QuizRun }) {
  return (
    <li className="hr-table-row">
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground/88">{run.title}</p>
        <p className="mt-1 text-xs text-foreground/45 lg:hidden">
          {MODE_LABEL[run.mode]} · {formatDate(run.playedAt)}
        </p>
      </div>
      <p className="hidden text-xs text-foreground/55 lg:block">{MODE_LABEL[run.mode]}</p>
      <p className="mt-2 text-xs tabular-nums text-foreground/72 lg:mt-0">
        <span className="text-bronze/90">
          {run.score}/{run.total}
        </span>
      </p>
      <p className="hidden text-xs text-foreground/48 lg:block">{formatDate(run.playedAt)}</p>
      <p className={cn("hr-result mt-2 lg:mt-0", RESULT_CLASS[run.result])}>
        {RESULT_LABEL[run.result]}
      </p>
    </li>
  );
}

type QuizHistoryListProps = {
  runs: readonly QuizRun[];
  onResetFilters?: () => void;
};

/** Clean quiz history table/list. */
export function QuizHistoryList({ runs, onResetFilters }: QuizHistoryListProps) {
  if (runs.length === 0) {
    return (
      <div className="hr-empty">
        <p className="hr-empty-title">No quiz runs yet</p>
        <p className="hr-empty-body">
          Complete your first expedition to start your history, or widen your filters.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <GeoButton asChild variant="primary" size="sm">
            <Link to="/play">Start an expedition</Link>
          </GeoButton>
          {onResetFilters ? (
            <GeoButton variant="secondary" size="sm" onClick={onResetFilters}>
              Reset filters
            </GeoButton>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="hr-table">
      <div className="hr-table-head" aria-hidden="true">
        <span>Quiz</span>
        <span>Mode</span>
        <span>Score</span>
        <span>Date</span>
        <span>Result</span>
      </div>
      <ul>
        {runs.map((run) => (
          <HistoryTableRow key={run.id} run={run} />
        ))}
      </ul>
    </div>
  );
}
