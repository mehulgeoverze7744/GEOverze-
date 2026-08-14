import { Link } from "@tanstack/react-router";
import { Bookmark, Coins, Minus, Plus, Trash2 } from "lucide-react";

import { CoverArt } from "@/features/play/components/CoverArt";
import type { CartLine } from "@/stores/cartStore";

import { categoryIcon, categoryLabel } from "../data/taxonomy";
import { credits as formatCredits, money } from "../lib/format";

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-bronze/18 text-foreground/55 transition-colors motion-fast hover:border-bronze/45 hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
    >
      {children}
    </button>
  );
}

/** One basket row: art, variant summary, quantity stepper and line total. */
export function CartLineRow({
  line,
  onQuantity,
  onRemove,
  onSave,
  onMoveToCart,
  variant = "cart",
}: {
  line: CartLine;
  onQuantity?: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onSave?: (id: string) => void;
  onMoveToCart?: (id: string) => void;
  variant?: "cart" | "saved";
}) {
  const optionSummary = Object.entries(line.options)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

  return (
    <div className="flex gap-4 border-b border-bronze/10 py-5 last:border-0">
      <Link
        to="/geostore/product/$slug"
        params={{ slug: line.slug }}
        className="w-20 shrink-0 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
        aria-label={line.name}
      >
        <CoverArt art={line.slug} icon={categoryIcon(line.category)} ratio="square" />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-[0.58rem] uppercase tracking-[0.2em] text-foreground/50">
          {categoryLabel(line.category)}
        </p>
        <h3 className="mt-1 text-sm font-light text-foreground">
          <Link
            to="/geostore/product/$slug"
            params={{ slug: line.slug }}
            className="transition-colors motion-fast hover:text-bronze-glow"
          >
            {line.name}
          </Link>
        </h3>
        {optionSummary ? (
          <p className="mt-1 text-[0.68rem] text-foreground/50">{optionSummary}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {variant === "cart" && onQuantity ? (
            <div className="flex items-center gap-2">
              <IconButton
                label={`Decrease quantity of ${line.name}`}
                onClick={() => onQuantity(line.id, line.quantity - 1)}
              >
                <Minus className="h-3.5 w-3.5" />
              </IconButton>
              <span className="w-6 text-center text-sm text-foreground/80" aria-live="polite">
                {line.quantity}
              </span>
              <IconButton
                label={`Increase quantity of ${line.name}`}
                onClick={() => onQuantity(line.id, line.quantity + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          ) : (
            <span className="text-xs text-foreground/50">Qty {line.quantity}</span>
          )}

          {variant === "cart" && onSave ? (
            <button
              type="button"
              onClick={() => onSave(line.id)}
              className="inline-flex items-center gap-1.5 text-[0.64rem] uppercase tracking-[0.16em] text-foreground/50 transition-colors motion-fast hover:text-bronze-glow"
            >
              <Bookmark className="h-3 w-3" /> Save for later
            </button>
          ) : null}

          {variant === "saved" && onMoveToCart ? (
            <button
              type="button"
              onClick={() => onMoveToCart(line.id)}
              className="text-[0.64rem] uppercase tracking-[0.16em] text-bronze transition-colors motion-fast hover:text-bronze-glow"
            >
              Move to cart
            </button>
          ) : null}

          <IconButton label={`Remove ${line.name}`} onClick={() => onRemove(line.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      <div className="shrink-0 text-right">
        {line.unitAmount !== null ? (
          <p className="text-sm font-light text-foreground">
            {money(line.unitAmount * line.quantity)}
          </p>
        ) : (
          <p className="inline-flex items-center gap-1.5 text-sm font-light text-bronze-glow">
            <Coins className="h-3.5 w-3.5" strokeWidth={1.6} />
            {formatCredits((line.unitCredits ?? 0) * line.quantity)}
          </p>
        )}
        {line.quantity > 1 && line.unitAmount !== null ? (
          <p className="mt-1 text-[0.64rem] text-foreground/50">{money(line.unitAmount)} each</p>
        ) : null}
      </div>
    </div>
  );
}
