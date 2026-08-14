import { Link } from "@tanstack/react-router";
import { Coins, PackagePlus } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { CoverArt } from "@/features/play/components/CoverArt";

import type { Bundle } from "../data/offers";
import { productBySlug } from "../data/products";
import { credits as formatCredits, discountPercent, money } from "../lib/format";

/** Bundle offer card: what's inside, the saving, and one add action. */
export function BundleCard({
  bundle,
  onAdd,
}: {
  bundle: Bundle;
  onAdd?: (bundle: Bundle) => void;
}) {
  const items = bundle.slugs
    .map(productBySlug)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const off = discountPercent(bundle.price, bundle.compareAt);

  return (
    <article className="overflow-hidden rounded-2xl border border-bronze/15 bg-charcoal/45">
      <CoverArt art={bundle.id} icon={PackagePlus} ratio="wide" />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-bronze/45 bg-bronze/12 px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-bronze-glow">
            Bundle
          </span>
          {off !== null ? (
            <span className="text-[0.62rem] uppercase tracking-[0.16em] text-foreground/50">
              Save {off}%
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-base font-light tracking-tight text-foreground">{bundle.name}</h3>
        <p className="mt-2 text-xs leading-relaxed text-foreground/50">{bundle.blurb}</p>

        <ul className="mt-4 space-y-1.5">
          {items.map((item) => (
            <li key={item.slug} className="text-xs text-foreground/60">
              <Link
                to="/geostore/product/$slug"
                params={{ slug: item.slug }}
                className="transition-colors motion-fast hover:text-bronze-glow"
              >
                · {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          <span className="text-xl font-light text-foreground">{money(bundle.price)}</span>
          <span className="text-xs text-foreground/50 line-through">{money(bundle.compareAt)}</span>
          {bundle.credits !== null ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-bronze-glow">
              <Coins className="h-3.5 w-3.5" strokeWidth={1.6} /> or {formatCredits(bundle.credits)}
            </span>
          ) : null}
        </div>

        {onAdd ? (
          <GeoButton
            variant="solid"
            size="sm"
            className="mt-5 w-full"
            onClick={() => onAdd(bundle)}
          >
            Add bundle to cart
          </GeoButton>
        ) : null}
      </div>
    </article>
  );
}
