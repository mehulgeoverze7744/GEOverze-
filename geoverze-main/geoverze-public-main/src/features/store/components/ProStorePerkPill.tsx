import { cn } from "@/lib/utils";

import "./pro-store-perk-pill.css";

const PERK_LABEL = "PRO • UP TO 10% OFF";

/** Visual Pro membership benefit — not a checkout or discount control. */
export function ProStorePerkPill({ className }: { className?: string | undefined }) {
  return (
    <span
      role="note"
      className={cn("pro-store-perk-pill", className)}
      title="Pro members receive up to 10% off GEOstore purchases"
    >
      {PERK_LABEL}
    </span>
  );
}
