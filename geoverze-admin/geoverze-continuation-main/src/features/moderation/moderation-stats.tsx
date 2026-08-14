import { AlertTriangle, Flag, Gavel, Scale, Siren } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { WidgetState } from "@/components/shared/widget";
import type { ModerationSummary } from "@/features/moderation/data";
import { num } from "@/lib/format";

export function ModerationStats({
  summary,
  state = "ready",
}: {
  summary: ModerationSummary;
  state?: WidgetState | undefined;
}) {
  return (
    <StatGrid columns={5} label="Moderation statistics">
      <StatCard label="Cases" value={num(summary.total)} icon={Flag} state={state} />
      <StatCard
        label="Awaiting review"
        value={num(summary.open)}
        icon={Gavel}
        hint="Open or investigating"
        state={state}
      />
      <StatCard
        label="Escalated"
        value={num(summary.escalated)}
        icon={Siren}
        hint="Trust & safety queue"
        state={state}
      />
      <StatCard
        label="Critical priority"
        value={num(summary.critical)}
        icon={AlertTriangle}
        state={state}
      />
      <StatCard
        label="Open appeals"
        value={num(summary.appeals)}
        icon={Scale}
        hint={`${num(summary.resolved)} resolved`}
        state={state}
      />
    </StatGrid>
  );
}
