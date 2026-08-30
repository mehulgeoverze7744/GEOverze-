import { Info } from "lucide-react";

import { GameCard } from "@/features/play/components/GameCard";
import { CREDIT_EXPIRY_NOTE, CREDIT_RULES } from "../data/credits";

/** Educational card that states the official credit rules. Display only. */
export function CreditRulesCard() {
  return (
    <GameCard interactive={false}>
      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-bronze/40 bg-bronze/12 text-bronze-glow"
            aria-hidden="true"
          >
            <Info className="h-4 w-4" strokeWidth={1.9} />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">How credits are earned</h3>
            <p className="mt-1 text-[0.83rem] leading-relaxed text-foreground/55">
              Credits come from PvP and multiplayer victories inside the current calendar month.
            </p>
          </div>
        </div>

        <ul className="mt-6 grid gap-3">
          {CREDIT_RULES.map((rule) => (
            <li
              key={rule.id}
              className="flex flex-col gap-2 rounded-xl border border-bronze/12 bg-[oklch(0.185_0.008_62)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground/85">{rule.condition}</p>
                <p className="mt-1 text-xs text-foreground/50">{rule.detail}</p>
              </div>
              <span className="shrink-0 rounded-full bg-gradient-bronze px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-background">
                {rule.award}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 border-t border-bronze/12 pt-5 text-[0.83rem] leading-relaxed text-foreground/55">
          {CREDIT_EXPIRY_NOTE}
        </p>
      </div>
    </GameCard>
  );
}
