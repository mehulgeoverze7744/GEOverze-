import type { Reward, RewardFilterState } from "@/features/rewards/types";

export function filterRewards(list: Reward[], query: string, filters: RewardFilterState): Reward[] {
  const term = query.trim().toLowerCase();
  return list.filter((reward) => {
    if (filters.type !== "all" && reward.type !== filters.type) return false;
    if (filters.status !== "all" && reward.status !== filters.status) return false;
    if (filters.eligibility !== "all" && reward.eligibility !== filters.eligibility) return false;
    if (!term) return true;
    return (
      reward.name.toLowerCase().includes(term) ||
      reward.id.toLowerCase().includes(term) ||
      reward.description.toLowerCase().includes(term)
    );
  });
}
