/**
 * StorefrontCategoryPage
 *
 * Wrapper used by every Gstore category / collection listing page:
 *   /geostore/category/$slug (T-Shirts, Hoodies, Accessories, etc.)
 *   /geostore/browse          (All Products)
 *
 * Imports storefront.css which hides the global dark site chrome and activates
 * the storefront-specific nav while this page is mounted. The shared site
 * footer stays visible so category pages match the homepage footer.
 */
import "./storefront.css";

import { type ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { StorefrontNav } from "./StorefrontNav";
import { SF_SHELL } from "./storefront-ui";
import { StorefrontCategoryGrid } from "./StorefrontCategoryGrid";
import { type EditorialItem } from "./EditorialCard";

const PER_PAGE = 9;

/* ─── Pagination ──────────────────────────────────────────────────────────── */

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;

  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Page navigation"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-label={`Page ${p}`}
          aria-current={p === current ? "page" : undefined}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors",
            p === current
              ? "border-black bg-black text-white"
              : "border-black/15 text-black hover:bg-black/5",
          )}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        aria-label="Next page"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </button>
    </nav>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export interface StorefrontCategoryPageProps {
  /** Category heading, e.g. "T-Shirts". */
  title: string;
  /** Optional subtitle shown beneath the heading. */
  description?: string;
  /** Flat list of all items for this category; the page handles its own pagination. */
  items: EditorialItem[];
  /** Handler for the "+" add-to-cart action on each card. */
  onAdd?: (item: EditorialItem) => void;
  /**
   * Optional slot rendered between the heading row and the grid.
   * Use for filter chips, coming-soon banners, etc.
   */
  notice?: ReactNode;
  /** Slot rendered just above the grid — e.g. filter/sort controls. */
  controls?: ReactNode;
  /** Optional floating control (mobile Filter). Rendered inside the storefront shell. */
  floatingAction?: ReactNode;
}

export function StorefrontCategoryPage({
  title,
  description,
  items,
  onAdd,
  notice,
  controls,
  floatingAction,
}: StorefrontCategoryPageProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const pageItems = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handlePageChange(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAdd(item: EditorialItem) {
    onAdd?.(item);
  }

  return (
    /*
     * #gvrze-storefront activates the rules in storefront.css that:
     *  - hide the global site navbar
     *  - hide the floating geostore icon row
     *  - set the light-canvas CSS variables
     *  - restyle the shared site footer to match the homepage
     */
    <div id="gvrze-storefront">
      <StorefrontNav variant="solid" />

      <main className="min-h-screen bg-[#f5f5f5]">
        <div className={cn(SF_SHELL, "pb-10 pt-5 md:py-14")}>
          {/* ── Heading row ── */}
          <div className="mb-5 flex items-start justify-between gap-4 md:mb-8">
            <div className="min-w-0 pr-16 md:pr-0">
              <h1
                className="text-[22px] font-semibold tracking-tight text-black md:text-[40px]"
                style={{ fontFamily: "var(--sf-font-body)" }}
              >
                {title}
              </h1>
              {description ? (
                <p className="mt-1 hidden text-sm text-black/50 md:block">{description}</p>
              ) : null}
            </div>
          </div>

          {/* ── Optional banner / notice ── */}
          {notice}

          {/* ── Optional controls (search, sort, filter chips) ── */}
          {controls}

          {/* ── Grid ── */}
          {pageItems.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-black/40">
                Nothing on this shelf yet — check back soon.
              </p>
            </div>
          ) : (
            <StorefrontCategoryGrid items={pageItems} onAdd={handleAdd} />
          )}

          {/* ── Pagination ── */}
          <Pagination current={page} total={totalPages} onChange={handlePageChange} />
        </div>
      </main>
      {floatingAction}
    </div>
  );
}
