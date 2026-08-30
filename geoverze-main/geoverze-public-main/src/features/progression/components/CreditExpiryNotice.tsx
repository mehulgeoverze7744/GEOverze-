import { CalendarClock } from "lucide-react";

import { GameCard } from "@/features/play/components/GameCard";
import { MetaChip } from "@/features/play/components/Badges";

import { aggregateExpiringLots } from "../lib/mapCreditLedgerEntry";
import type { ExpiringCreditLot } from "../data/credits";

/** Upcoming credit expiry from unspent earn lots. */
export function CreditExpiryNotice({ lots }: { lots: readonly ExpiringCreditLot[] }) {
  if (lots.length === 0) return null;

  const grouped = aggregateExpiringLots(lots);

  return (
    <GameCard interactive={false}>
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MetaChip tone="bronze">
            <CalendarClock className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" /> Expiring soon
          </MetaChip>
        </div>
        <p className="mt-5 text-base font-semibold text-foreground">Credits expiring soon</p>
        <p className="mt-2 text-[0.83rem] leading-relaxed text-foreground/55">
          Spend these credits before their use-by date. Dates come from your earn lots on the
          server.
        </p>
        <ul className="mt-5 grid gap-3">
          {grouped.map((item) => (
            <li
              key={item.expiresLabel}
              className="flex items-center justify-between gap-4 rounded-xl border border-bronze/12 bg-[oklch(0.185_0.008_62)] px-4 py-3"
            >
              <span className="text-sm text-foreground/80">
                {item.totalAmount} {item.totalAmount === 1 ? "credit" : "credits"} expire{" "}
                {item.expiresLabel}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </GameCard>
  );
}
