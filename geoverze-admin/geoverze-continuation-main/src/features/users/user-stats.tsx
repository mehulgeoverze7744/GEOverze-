import { BadgeCheck, Crown, ShieldAlert, Sparkles, UserPlus, Users, Zap } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { WidgetState } from "@/components/shared/widget";
import { userStats } from "@/features/users/data";
import { num } from "@/lib/format";

const cards = [
  {
    key: "total",
    label: "Total Users",
    value: userStats.total,
    delta: 6.4,
    icon: Users,
    hint: "all accounts",
  },
  {
    key: "activeToday",
    label: "Active Today",
    value: userStats.activeToday,
    delta: 2.1,
    icon: Zap,
    hint: "last 24h",
  },
  {
    key: "newThisWeek",
    label: "New This Week",
    value: userStats.newThisWeek,
    delta: 11.8,
    icon: UserPlus,
    hint: "7d signups",
  },
  {
    key: "premium",
    label: "Premium Members",
    value: userStats.premium,
    delta: 4.2,
    icon: Crown,
    hint: "Premium + Elite",
  },
  {
    key: "creators",
    label: "Creators",
    value: userStats.creators,
    delta: 1.6,
    icon: Sparkles,
    hint: "approved",
  },
  {
    key: "suspended",
    label: "Suspended Users",
    value: userStats.suspended,
    delta: -3.4,
    icon: ShieldAlert,
    hint: "policy holds",
  },
  {
    key: "pendingVerifications",
    label: "Pending Verifications",
    value: userStats.pendingVerification,
    delta: 0,
    icon: BadgeCheck,
    hint: "age checks",
  },
] as const;

export interface UserStatsProps {
  state?: WidgetState | undefined;
  onSelect?: ((key: string) => void) | undefined;
}

export function UserStats({ state = "ready", onSelect }: UserStatsProps) {
  return (
    <StatGrid columns={7} label="User overview statistics">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          label={card.label}
          value={num(card.value)}
          delta={card.delta}
          hint={card.hint}
          icon={card.icon}
          state={state}
          onClick={onSelect ? () => onSelect(card.key) : undefined}
        />
      ))}
    </StatGrid>
  );
}
