import { Link } from "@tanstack/react-router";
import { CircleDot, Clock, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelative } from "../lib/format";
import { REVIEW_QUEUE, STUDIO_ACTIVITY, STUDIO_TIPS } from "../data/workspace";
import { StudioPanel, StudioPanelHeader } from "./StudioPanel";

const STAGE_TONE: Record<string, string> = {
  queued: "text-foreground/50",
  "in-review": "text-[oklch(0.85_0.11_80)]",
  "changes-requested": "text-[oklch(0.84_0.15_25)]",
};

/** Right-hand context rail: review queue, recent activity, a working tip. */
export function StudioContext({ tipIndex = 0 }: { tipIndex?: number }) {
  const tip = STUDIO_TIPS[tipIndex % STUDIO_TIPS.length];

  return (
    <div className="space-y-4">
      <StudioPanel>
        <StudioPanelHeader title="Review queue" hint="Submissions awaiting a decision" />
        <ul className="space-y-3">
          {REVIEW_QUEUE.map((item) => (
            <li key={item.id} className="border-l border-bronze/20 pl-3">
              <p className="text-[0.82rem] font-medium text-foreground/85">{item.title}</p>
              <p className={cn("mt-1 text-[0.72rem]", STAGE_TONE[item.stage])}>
                {item.stage === "changes-requested"
                  ? "Changes requested"
                  : item.stage === "in-review"
                    ? "In review"
                    : "Queued"}{" "}
                · {item.type}
              </p>
              <p className="mt-1 text-[0.72rem] text-foreground/50">{item.note}</p>
            </li>
          ))}
        </ul>
      </StudioPanel>

      <StudioPanel>
        <StudioPanelHeader title="Recent activity" />
        <ul className="space-y-3.5">
          {STUDIO_ACTIVITY.slice(0, 5).map((entry) => (
            <li key={entry.id} className="flex gap-2.5">
              <CircleDot
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze/90"
                strokeWidth={2}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-[0.8rem] leading-snug text-foreground/80">{entry.label}</p>
                <p className="mt-0.5 text-[0.7rem] text-foreground/50">
                  {entry.detail} · {formatRelative(entry.at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </StudioPanel>

      {tip ? (
        <StudioPanel className="border-bronze/25 bg-bronze/[0.06]">
          <div className="flex items-center gap-2 text-bronze">
            <Lightbulb className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            <p className="text-[0.72rem] uppercase tracking-[0.16em]">Creator tip</p>
          </div>
          <p className="mt-3 text-[0.85rem] font-medium text-foreground/90">{tip.title}</p>
          <p className="mt-1.5 text-[0.78rem] leading-relaxed text-foreground/55">{tip.body}</p>
        </StudioPanel>
      ) : null}

      <StudioPanel className="flex items-center gap-3">
        <Clock className="h-4 w-4 shrink-0 text-foreground/50" strokeWidth={1.8} aria-hidden />
        <p className="text-[0.78rem] text-foreground/50">
          Publishing and analytics are placeholders for now.{" "}
          <Link to="/support" className="text-bronze underline-offset-4 hover:underline">
            Contact support
          </Link>
        </p>
      </StudioPanel>
    </div>
  );
}
