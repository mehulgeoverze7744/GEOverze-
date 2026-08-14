import { daysSince } from "@/features/creators/data";
import type { CreatorFilterState, CreatorRecord } from "@/features/creators/types";

const joinedWindow: Record<string, number> = {
  "Last 30 days": 30,
  "Last 90 days": 90,
  "Last 12 months": 365,
  "Over 12 months": Infinity,
};

export function matchesCreatorSearch(creator: CreatorRecord, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    creator.displayName,
    creator.username,
    creator.email,
    creator.country,
    creator.tier,
    creator.id,
  ].some((field) => field.toLowerCase().includes(q));
}

export function filterCreators(
  creators: CreatorRecord[],
  query: string,
  filters: CreatorFilterState,
): CreatorRecord[] {
  return creators.filter((creator) => {
    if (!matchesCreatorSearch(creator, query)) return false;
    if (filters.tier !== "all" && creator.tier !== filters.tier) return false;
    if (filters.verification !== "all" && creator.verification !== filters.verification)
      return false;
    if (filters.status !== "all" && creator.status !== filters.status) return false;
    if (filters.country !== "all" && creator.country !== filters.country) return false;
    if (filters.activityState !== "all" && creator.activityState !== filters.activityState)
      return false;
    if (filters.joinedWithin !== "all") {
      const days = daysSince(creator.joinDate);
      if (filters.joinedWithin === "Over 12 months") {
        if (days <= 365) return false;
      } else if (days > (joinedWindow[filters.joinedWithin] ?? Infinity)) {
        return false;
      }
    }
    return true;
  });
}
