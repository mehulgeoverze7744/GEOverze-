import { catalogDaysSince } from "@/lib/catalog";
import type { CreditFilterState, CreditTransaction } from "@/features/credits/types";

export function filterTransactions(
  list: CreditTransaction[],
  query: string,
  filters: CreditFilterState,
): CreditTransaction[] {
  const term = query.trim().toLowerCase();
  return list.filter((item) => {
    if (filters.direction !== "all" && item.direction !== filters.direction) return false;
    if (filters.reason !== "all" && item.reason !== filters.reason) return false;
    if (filters.window !== "all" && catalogDaysSince(item.createdAt) > Number(filters.window))
      return false;
    if (!term) return true;
    return (
      item.user.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      item.reference.toLowerCase().includes(term)
    );
  });
}
