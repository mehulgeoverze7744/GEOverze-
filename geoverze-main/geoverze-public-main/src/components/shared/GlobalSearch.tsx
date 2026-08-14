import { Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { GeoButton } from "@/components/shared/GeoButton";
import { GeoTooltip } from "@/components/shared/GeoTooltip";
import { Modal } from "@/components/shared/Modal";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SEARCH_SUGGESTIONS, groupHits, searchAll } from "@/features/search/data/index";

/**
 * Global search overlay.
 *
 * Ranks results client-side over the placeholder index in
 * `src/features/search/data` — swapping in a server query later touches only
 * `searchAll`. Opens with ⌘K / Ctrl+K.
 */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Debounced so a future server-side query fires once per pause, not per key.
  const debounced = useDebouncedValue(query);
  const hits = useMemo(() => searchAll(debounced), [debounced]);
  const grouped = useMemo(() => groupHits(hits), [hits]);
  const hasQuery = debounced.trim().length > 0;
  const searching = query.trim() !== debounced.trim();

  return (
    <>
      <GeoTooltip label="Search  ⌘K">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open search"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bronze/25 text-bronze/90 motion-fast transition-colors hover:border-bronze/50 hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
        >
          <Search className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </GeoTooltip>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Search GEOverze"
        description="Quizzes, articles, creators, community threads and store items."
      >
        <div className="space-y-6">
          <SearchBar
            id="global-search"
            label="Search GEOverze"
            placeholder="Countries, capitals, oceans, packs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            loading={searching}
            onClear={() => setQuery("")}
          />

          <p className="sr-only" aria-live="polite">
            {hasQuery ? `${hits.length} results for ${query}` : "Type to search"}
          </p>

          {hasQuery && hits.length === 0 ? (
            <div className="rounded-2xl border border-bronze/15 bg-charcoal/40 p-6 text-center">
              <p className="text-sm text-foreground/60">Nothing found for “{query.trim()}”.</p>
              <p className="mt-2 text-xs leading-relaxed text-foreground/50">
                Try a country, a capital, a landform or a quiz name.
              </p>
            </div>
          ) : null}

          {hasQuery && hits.length > 0 ? (
            <div className="max-h-[46vh] space-y-6 overflow-y-auto pr-1">
              {grouped.map(({ group, hits: items }) => (
                <section key={group.id}>
                  <h3 className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-bronze/90">
                    <group.icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    {group.label}
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {items.map((hit) => (
                      <li key={hit.id}>
                        <Link
                          to={hit.to}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-2.5 motion-fast transition-colors hover:border-bronze/25 hover:bg-bronze/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-foreground/85">
                              {hit.title}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-foreground/50">
                              {hit.meta}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : null}

          {hasQuery ? null : (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-bronze/90">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                Popular destinations
              </p>
              {SEARCH_SUGGESTIONS.map((item) => (
                <GeoButton
                  key={item.label}
                  asChild
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => setOpen(false)}
                >
                  <Link to={item.to}>
                    <item.icon className="h-4 w-4" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                </GeoButton>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
