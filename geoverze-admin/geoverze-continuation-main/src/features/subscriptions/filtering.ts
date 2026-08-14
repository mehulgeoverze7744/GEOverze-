import type { Subscriber, SubscriberFilterState } from "@/features/subscriptions/types";

export function filterSubscribers(
  list: Subscriber[],
  query: string,
  filters: SubscriberFilterState,
): Subscriber[] {
  const term = query.trim().toLowerCase();
  return list.filter((sub) => {
    if (filters.tier !== "all" && sub.tier !== filters.tier) return false;
    if (filters.status !== "all" && sub.status !== filters.status) return false;
    if (filters.cycle !== "all" && sub.cycle !== filters.cycle) return false;
    if (!term) return true;
    return (
      sub.account.toLowerCase().includes(term) ||
      sub.contact.toLowerCase().includes(term) ||
      sub.id.toLowerCase().includes(term)
    );
  });
}
