import { daysSince } from "@/features/users/data";
import type { PlatformUser, UserFilterState } from "@/features/users/types";

const registeredWindow: Record<string, number> = {
  "Last 7 days": 7,
  "Last 30 days": 30,
  "Last 90 days": 90,
  "Last 12 months": 365,
};

function matchesLastActive(user: PlatformUser, option: string) {
  const days = daysSince(user.lastActiveAt);
  switch (option) {
    case "Today":
      return days < 1;
    case "Last 7 days":
      return days <= 7;
    case "Last 30 days":
      return days <= 30;
    case "Over 30 days":
      return days > 30;
    default:
      return true;
  }
}

function inRange(value: number, min: string, max: string) {
  if (min !== "" && value < Number(min)) return false;
  if (max !== "" && value > Number(max)) return false;
  return true;
}

export function matchesSearch(user: PlatformUser, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [user.username, user.displayName, user.email, user.country, user.id].some((field) =>
    field.toLowerCase().includes(q),
  );
}

export function filterUsers(
  users: PlatformUser[],
  query: string,
  filters: UserFilterState,
): PlatformUser[] {
  return users.filter((user) => {
    if (!matchesSearch(user, query)) return false;
    if (filters.membership !== "all" && user.membership !== filters.membership) return false;
    if (filters.role !== "all" && user.role !== filters.role) return false;
    if (filters.country !== "all" && user.country !== filters.country) return false;
    if (filters.status !== "all" && user.status !== filters.status) return false;
    if (filters.creatorStatus !== "all" && user.creatorStatus !== filters.creatorStatus)
      return false;
    if (filters.ageVerification !== "all") {
      const wantVerified = filters.ageVerification === "Verified";
      if (user.ageVerified !== wantVerified) return false;
    }
    if (filters.registeredWithin !== "all") {
      const window = registeredWindow[filters.registeredWithin] ?? Infinity;
      if (daysSince(user.registeredAt) > window) return false;
    }
    if (!matchesLastActive(user, filters.lastActiveWithin)) return false;
    if (!inRange(user.credits, filters.creditsMin, filters.creditsMax)) return false;
    if (!inRange(user.xp, filters.xpMin, filters.xpMax)) return false;
    return true;
  });
}
