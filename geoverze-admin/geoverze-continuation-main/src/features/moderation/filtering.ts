import { catalogDaysSince } from "@/lib/catalog";
import type { CaseFilterState, ModerationCase } from "@/features/moderation/types";

export function filterCases(
  cases: ModerationCase[],
  query: string,
  filters: CaseFilterState,
): ModerationCase[] {
  const needle = query.trim().toLowerCase();
  return cases.filter((item) => {
    if (
      needle &&
      ![item.id, item.title, item.reporter, item.reportedUser, item.reason, item.assignee].some(
        (value) => value.toLowerCase().includes(needle),
      )
    ) {
      return false;
    }
    if (filters.priority !== "all" && item.priority !== filters.priority) return false;
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (filters.reason !== "all" && item.reason !== filters.reason) return false;
    if (filters.window !== "all") {
      const days = Number(filters.window);
      if (catalogDaysSince(item.reportedAt) > days) return false;
    }
    return true;
  });
}
