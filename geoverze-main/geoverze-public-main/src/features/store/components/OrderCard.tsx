import { Link } from "@tanstack/react-router";
import { Coins, Package, Truck } from "lucide-react";

import { cn } from "@/lib/utils";

import { ORDER_STATUS_LABEL, type Order } from "../data/orders";
import { credits as formatCredits, money, shortDate } from "../lib/format";

const TONE: Record<Order["status"], string> = {
  processing: "border-bronze/40 text-bronze",
  shipped: "border-bronze/55 bg-bronze/12 text-bronze-glow",
  delivered: "border-bronze/25 text-foreground/60",
  unlocked: "border-bronze/45 bg-bronze/10 text-bronze-glow",
  cancelled: "border-foreground/15 text-foreground/50",
};

/** Order history row with line summary and fulfilment state. */
export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="rounded-2xl border border-bronze/12 bg-charcoal/45 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-light tracking-tight text-foreground">{order.id}</p>
          <p className="mt-1 text-[0.66rem] uppercase tracking-[0.18em] text-foreground/50">
            {shortDate(order.placedAt)}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em]",
            TONE[order.status],
          )}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <ul className="mt-5 space-y-2">
        {order.lines.map((line) => (
          <li
            key={`${order.id}-${line.slug}`}
            className="flex items-baseline justify-between gap-4"
          >
            <Link
              to="/geostore/product/$slug"
              params={{ slug: line.slug }}
              className="min-w-0 text-xs text-foreground/65 transition-colors motion-fast hover:text-bronze-glow"
            >
              {line.name}
              {line.quantity > 1 ? ` × ${line.quantity}` : ""}
            </Link>
            <span className="shrink-0 text-xs text-foreground/50">
              {line.credits > 0 ? formatCredits(line.credits) : money(line.amount)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-bronze/10 pt-4">
        <p className="inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-foreground/50">
          {order.shipping ? (
            <>
              <Truck className="h-3.5 w-3.5" /> {order.shipping}
              {order.tracking ? ` · ${order.tracking}` : ""}
            </>
          ) : (
            <>
              <Package className="h-3.5 w-3.5" /> Digital delivery
            </>
          )}
        </p>
        <p className="flex items-center gap-3 text-sm font-light text-foreground">
          {order.total > 0 ? money(order.total) : null}
          {order.credits > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-bronze-glow">
              <Coins className="h-3.5 w-3.5" strokeWidth={1.6} /> {order.credits}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  );
}
