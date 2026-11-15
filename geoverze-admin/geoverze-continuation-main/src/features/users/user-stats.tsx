import { BadgeCheck, Crown, ShieldAlert, Sparkles, UserPlus, Users, Zap } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { WidgetState } from "@/components/shared/widget";
import type { PlatformUser } from "@/features/users/types";
import { daysSince, num } from "@/lib/format";

export function summarizeUsers(users: PlatformUser[]) {
  return {
    total: users.length,
    activeToday: users.filter((u) => daysSince(u.lastActiveAt) < 1).length,
    newThisWeek: users.filter((u) => daysSince(u.registeredAt) <= 7).length,
    premium: users.filter((u) => u.membership === "Pro" || u.membership === "Advance").length,
    creators: users.filter((u) => u.creatorStatus === "Approved").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    pendingVerification: users.filter((u) => !u.ageVerified).length,
  };
}

export interface UserStatsProps {
  state?: WidgetState | undefined;
  onSelect?: ((key: string) => void) | undefined;
  users?: PlatformUser[] | undefined;
}

export function UserStats({ state = "ready", onSelect, users = [] }: UserStatsProps) {
  const userStats = summarizeUsers(users);
  const cards = [
    { key: "total", label: "Total Users", value: userStats.total, icon: Users, hint: "all accounts" },
    { key: "activeToday", label: "Active Today", value: userStats.activeToday, icon: Zap, hint: "last 24h" },
    { key: "newThisWeek", label: "New This Week", value: userStats.newThisWeek, icon: UserPlus, hint: "7d signups" },
    { key: "premium", label: "Paid members", value: userStats.premium, icon: Crown, hint: "Pro + Advance" },
    { key: "creators", label: "Creators", value: userStats.creators, icon: Sparkles, hint: "approved" },
    {
      key: "suspended",
      label: "Suspended Users",
      value: userStats.suspended,
      icon: ShieldAlert,
      hint: "policy holds",
    },
    {
      key: "pendingVerifications",
      label: "Pending Verifications",
      value: userStats.pendingVerification,
      icon: BadgeCheck,
      hint: "age checks",
    },
  ];

  return (
    <StatGrid columns={7} label="User overview statistics">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          label={card.label}
          value={num(card.value)}
          hint={card.hint}
          icon={card.icon}
          state={state}
          onClick={onSelect ? () => onSelect(card.key) : undefined}
        />
      ))}
    </StatGrid>
  );
}
