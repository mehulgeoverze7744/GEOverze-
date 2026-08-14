import { Flame, Target } from "lucide-react";

import { AvatarMark } from "@/features/auth/components/AvatarMark";
import { cn } from "@/lib/utils";
import type { StandingRow } from "../data/standings";

/** One leaderboard row. Rendered inside a semantic table. */
export function LeaderboardRow({ row }: { row: StandingRow }) {
  return (
    <tr className={cn("border-b border-bronze/10 last:border-0", row.you && "bg-bronze/[0.07]")}>
      <th
        scope="row"
        className="whitespace-nowrap px-4 py-4 text-left text-sm font-semibold text-bronze-glow tabular-nums"
      >
        #{row.rank}
      </th>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <AvatarMark id={row.avatarId} size={36} className="border border-bronze/25" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {row.username}
              {row.you ? (
                <span className="ml-2 text-[0.6rem] uppercase tracking-[0.16em] text-bronze/90">
                  You
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 text-[0.68rem] text-foreground/50">
              <span aria-hidden="true">{row.flag}</span> {row.country}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-foreground/70 tabular-nums">{row.level}</td>
      <td className="px-4 py-4 text-sm text-foreground/70 tabular-nums">
        {row.xp.toLocaleString()}
      </td>
      <td className="px-4 py-4 text-sm text-foreground/70 tabular-nums">
        <span className="inline-flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-bronze/90" strokeWidth={2} aria-hidden="true" />
          {row.streak}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-foreground/70 tabular-nums">
        <span className="inline-flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-bronze/90" strokeWidth={2} aria-hidden="true" />
          {row.accuracy.toFixed(1)}%
        </span>
      </td>
    </tr>
  );
}
