import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type HistoryRewardsTab = "history" | "achievements" | "rewards";

const TABS: readonly { id: HistoryRewardsTab; label: string }[] = [
  { id: "history", label: "History" },
  { id: "achievements", label: "Achievements" },
  { id: "rewards", label: "Rewards" },
] as const;

type HistoryRewardsTabsProps = {
  active: HistoryRewardsTab;
  onChange: (tab: HistoryRewardsTab) => void;
  className?: string;
};

/** Primary segmented navigation for the unified page. */
export function HistoryRewardsTabs({ active, onChange, className }: HistoryRewardsTabsProps) {
  const activeIndex = TABS.findIndex((tab) => tab.id === active);

  return (
    <div
      className={cn("hr-tabs", className)}
      style={{ "--hr-active-index": activeIndex } as CSSProperties}
      role="tablist"
      aria-label="Quiz history and rewards sections"
    >
      <span className="hr-tabs-indicator" aria-hidden="true" />
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`hr-tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`hr-panel-${tab.id}`}
          data-active={active === tab.id}
          onClick={() => onChange(tab.id)}
          className="hr-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
