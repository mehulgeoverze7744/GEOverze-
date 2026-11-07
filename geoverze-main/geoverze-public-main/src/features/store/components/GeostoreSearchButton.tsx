import { Link } from "@tanstack/react-router";
import { Clock3, Coins, Lock, Search, ShoppingBag } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";

import { Modal, SearchBar } from "@/components/shared";
import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";
import { selectRecentSearches, useStoreStore } from "@/stores/storeStore";

import { geostoreActionLinkClass } from "./geostore-action-link";
import { isPurchaseLocked, PRODUCTS } from "../data/products";
import { productImageForSlug } from "../data/productImages";
import { categoryIcon, categoryLabel } from "../data/taxonomy";
import { searchStoreProducts } from "../lib/filter";
import { credits as formatCredits, money } from "../lib/format";

import "./geostore-search.css";

/**
 * Fixed Gstore search icon — opens the product search panel.
 * `renderTrigger` lets a surface with its own visual language (the storefront)
 * supply the opener while reusing the same search panel and recent searches.
 */
export function GeostoreSearchButton({
  className,
  renderTrigger,
}: {
  className?: string;
  renderTrigger?: (props: { open: boolean; onOpen: () => void }) => ReactNode;
}) {
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
      {renderTrigger ? (
        renderTrigger({ open, onOpen: () => setOpen(true) })
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search Gstore"
          title="Search"
          className={cn(geostoreActionLinkClass(open), className)}
        >
          <Search className="h-4 w-4" strokeWidth={1.8} aria-hidden />
        </button>
      )}

      <Modal
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
          else setOpen(true);
        }}
        title="Search Gstore"
        description="Find exact products from the catalogue."
        className="gvrze-gstore-search"
      >
        <div className="space-y-5">
          <form onSubmit={handleSubmit}>
            <SearchBar
              id={inputId}
              ref={inputRef}
              label="Search Gstore products"
              placeholder="Search hoodies, mugs, packs…"
              className="border-[#E2E5E9] bg-white text-[#172335] placeholder:text-[#687586] focus:border-[#2B74C4] focus:ring-[#2B74C4]/20"
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
                  const locked = isPurchaseLocked(product);
                  const rowClass =
                    "gvrze-gstore-search__result flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors motion-fast";
                  const content = (
                    <>
                      <div className="gvrze-gstore-search__thumb relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        {image ? (
                          <img
                            src={image.src}
                            alt=""
                            className={cn(
                              "h-full w-full object-cover",
                              locked && "scale-[1.14] blur-[8px]",
                            )}
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
                        <span className="gvrze-gstore-search__result-name block truncate text-sm">
                          {product.name}
                        </span>
                        <span className="gvrze-gstore-search__result-meta mt-0.5 block truncate text-[0.66rem] uppercase tracking-[0.14em]">
                          {locked ? "Coming soon" : categoryLabel(product.category)}
                        </span>
                        {locked ? null : (
                          <span className="gvrze-gstore-search__result-meta mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                            {product.price !== null ? <span>{money(product.price)}</span> : null}
                            {product.credits !== null ? (
                              <span className="inline-flex items-center gap-1">
                                <Coins className="h-3 w-3" strokeWidth={1.6} aria-hidden />
                                {formatCredits(product.credits)}
                              </span>
                            ) : null}
                          </span>
                        )}
                      </span>
                      {locked ? (
                        <Lock
                          className="gvrze-gstore-search__result-icon h-3.5 w-3.5 shrink-0"
                          strokeWidth={1.6}
                          aria-hidden
                        />
                      ) : (
                        <ShoppingBag
                          className="gvrze-gstore-search__result-icon h-3.5 w-3.5 shrink-0"
                          strokeWidth={1.6}
                          aria-hidden
                        />
                      )}
                    </>
                  );
                  return (
                    <li key={product.id}>
                      {locked && product.category === "hoodies" ? (
                        <div className={cn(rowClass, "cursor-default")} aria-disabled="true">
                          {content}
                        </div>
                      ) : (
                        <Link
                          to="/geostore/product/$slug"
                          params={{ slug: product.slug }}
                          onClick={close}
                          className={cn(
                            rowClass,
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B74C4]/40",
                          )}
                        >
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="gvrze-gstore-search__empty rounded-2xl px-5 py-8 text-center">
                <p className="text-sm">No products found</p>
                <p className="mt-2 text-xs leading-relaxed">
                  No Gstore matches for “{submittedQuery}”. Try another name or category.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <p className="gvrze-gstore-search__recent-label">
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
                        className="gvrze-gstore-search__recent-item flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B74C4]/40"
                      >
                        <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
                        <span className="truncate">{entry}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="gvrze-gstore-search__empty rounded-xl px-4 py-5 text-xs leading-relaxed">
                  Your previous Gstore searches will appear here after you search for a product.
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
