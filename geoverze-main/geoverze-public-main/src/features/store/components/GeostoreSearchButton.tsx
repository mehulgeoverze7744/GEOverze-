import { Link } from "@tanstack/react-router";
import { Clock3, Coins, Search, ShoppingBag } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";

import { Modal, SearchBar } from "@/components/shared";
import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";
import { selectRecentSearches, useStoreStore } from "@/stores/storeStore";

import { geostoreActionLinkClass } from "./geostore-action-link";
import { PRODUCTS } from "../data/products";
import { productImageForSlug } from "../data/productImages";
import { categoryIcon, categoryLabel } from "../data/taxonomy";
import { searchStoreProducts } from "../lib/filter";
import { credits as formatCredits, money } from "../lib/format";

/** Fixed GEOstore search control — opens a product search panel below cart/wishlist. */
export function GeostoreSearchButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const recentSearches = useStoreStore(selectRecentSearches);
  const rememberSearch = useStoreStore((state) => state.rememberSearch);

  const results = useMemo(
    () => searchStoreProducts(PRODUCTS, submittedQuery, 12),
    [submittedQuery],
  );

  const hasSubmitted = submittedQuery.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setSubmittedQuery("");
  };

  const runSearch = (value: string) => {
    const next = value.trim().replace(/\s+/g, " ");
    setQuery(next);
    setSubmittedQuery(next);
    if (next) rememberSearch(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(query);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search GEOstore"
        title="Search"
        className={cn(geostoreActionLinkClass(open), className)}
      >
        <Search className="h-4 w-4" strokeWidth={1.8} aria-hidden />
        <span className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.18em] sm:inline">
          Search
        </span>
      </button>

      <Modal
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
          else setOpen(true);
        }}
        title="Search GEOstore"
        description="Find exact products from the catalogue."
      >
        <div className="space-y-5">
          <form onSubmit={handleSubmit}>
            <SearchBar
              id={inputId}
              ref={inputRef}
              label="Search GEOstore products"
              placeholder="Search hoodies, mugs, packs…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (!event.target.value.trim()) setSubmittedQuery("");
              }}
              onClear={() => {
                setQuery("");
                setSubmittedQuery("");
                inputRef.current?.focus();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  close();
                }
              }}
            />
          </form>

          <p className="sr-only" aria-live="polite">
            {hasSubmitted
              ? `${results.length} products for ${submittedQuery}`
              : "Type a product name and press Enter"}
          </p>

          {hasSubmitted ? (
            results.length > 0 ? (
              <ul className="max-h-[min(48vh,22rem)] space-y-2 overflow-y-auto pr-1">
                {results.map((product) => {
                  const image = productImageForSlug(product.slug);
                  const Icon = categoryIcon(product.category);
                  return (
                    <li key={product.id}>
                      <Link
                        to="/geostore/product/$slug"
                        params={{ slug: product.slug }}
                        onClick={close}
                        className="flex items-center gap-3 rounded-xl border border-bronze/12 bg-charcoal/55 px-3 py-2.5 transition-colors motion-fast hover:border-bronze/35 hover:bg-bronze/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-bronze/15 bg-charcoal/80">
                          {image ? (
                            <img
                              src={image.src}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <CoverArt
                              art={product.slug}
                              icon={Icon}
                              ratio="square"
                              className="h-full w-full rounded-none"
                            />
                          )}
                        </div>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-foreground/90">
                            {product.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[0.66rem] uppercase tracking-[0.14em] text-foreground/45">
                            {categoryLabel(product.category)}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-foreground/65">
                            {product.price !== null ? <span>{money(product.price)}</span> : null}
                            {product.credits !== null ? (
                              <span className="inline-flex items-center gap-1 text-bronze-glow">
                                <Coins className="h-3 w-3" strokeWidth={1.6} aria-hidden />
                                {formatCredits(product.credits)}
                              </span>
                            ) : null}
                          </span>
                        </span>
                        <ShoppingBag
                          className="h-3.5 w-3.5 shrink-0 text-bronze/80"
                          strokeWidth={1.6}
                          aria-hidden
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-2xl border border-bronze/15 bg-charcoal/45 px-5 py-8 text-center">
                <p className="text-sm text-foreground/70">No products found</p>
                <p className="mt-2 text-xs leading-relaxed text-foreground/50">
                  No GEOstore matches for “{submittedQuery}”. Try another name or category.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
                <Clock3 className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
                Recent searches
              </p>
              {recentSearches.length > 0 ? (
                <ul className="space-y-1.5">
                  {recentSearches.map((entry) => (
                    <li key={entry}>
                      <button
                        type="button"
                        onClick={() => runSearch(entry)}
                        className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm text-foreground/75 transition-colors motion-fast hover:border-bronze/25 hover:bg-bronze/5 hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
                      >
                        <Search className="h-3.5 w-3.5 shrink-0 text-bronze/80" strokeWidth={1.6} />
                        <span className="truncate">{entry}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-bronze/12 bg-charcoal/40 px-4 py-5 text-xs leading-relaxed text-foreground/50">
                  Your previous GEOstore searches will appear here after you search for a product.
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
