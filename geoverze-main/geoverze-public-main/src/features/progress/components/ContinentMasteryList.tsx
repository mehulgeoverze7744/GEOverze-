import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";

import { CONTINENT_MASTERY, masteryPct } from "../data/mastery";

/** Per-continent mastery bars with visited/mastered counts. */
export function ContinentMasteryList() {
  return (
    <ul className="space-y-6">
      {CONTINENT_MASTERY.map((continent) => {
        const pct = masteryPct(continent);
        return (
          <li key={continent.id}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-foreground/80">{continent.label}</p>
              <p className="text-xs text-foreground/50">
                <span className="text-gradient-bronze">{pct}%</span> · {continent.mastered} of{" "}
                {continent.total} mastered
              </p>
            </div>
            <ProgressBarFill
              className="mt-3"
              value={pct}
              label={`${continent.label} mastery`}
              valueText={`${continent.mastered} of ${continent.total} countries mastered`}
            />
            <p className="mt-2 text-xs text-foreground/50">
              {continent.visited} visited in at least one quiz
            </p>
          </li>
        );
      })}
    </ul>
  );
}
