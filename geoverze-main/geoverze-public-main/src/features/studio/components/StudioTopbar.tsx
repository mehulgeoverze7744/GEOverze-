import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, PanelRight, Plus, Search } from "lucide-react";
import { useState } from "react";

import { GeoButton } from "@/components/shared/GeoButton";
import { GeoDropdown, GeoDropdownItem } from "@/components/shared/GeoDropdown";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/stores/studioStore";
import { CREATOR } from "../data/creator";
import { STUDIO_NAV } from "../data/workspace";

/** Workspace top bar: breadcrumb, quick search, create menu, account. */
export function StudioTopbar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const toggleSidebar = useStudioStore((s) => s.toggleSidebar);
  const toggleContext = useStudioStore((s) => s.toggleContextPanel);
  const [query, setQuery] = useState("");

  const current =
    STUDIO_NAV.flatMap((g) => g.items).find(
      (i) => (i.exact ? pathname === i.to : pathname.startsWith(i.to)) && i.to !== "/studio",
    ) ?? STUDIO_NAV[0]?.items[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e2e8f0] bg-[#ffffff] px-4 md:px-6">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
        className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-bronze/10 hover:text-foreground"
      >
        <Menu className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.8} />
      </button>

      <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-[0.8rem] sm:flex">
        <Link to="/studio" className="text-foreground/50 transition-colors hover:text-bronze">
          Studio
        </Link>
        {current && current.to !== "/studio" ? (
          <>
            <span className="text-foreground/50" aria-hidden>
              /
            </span>
            <span className="font-medium text-foreground/85">{current.label}</span>
          </>
        ) : null}
      </nav>

      <div className="relative ml-auto hidden w-full max-w-xs items-center lg:flex">
        <Search
          className="pointer-events-none absolute left-3 h-4 w-4 text-foreground/50"
          strokeWidth={1.8}
          aria-hidden
        />
        <label htmlFor="studio-search" className="sr-only">
          Search your content
        </label>
        <input
          id="studio-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search quizzes, articles, media"
          className="h-9 w-full rounded-lg border border-[#e2e8f0] bg-[#ffffff] pl-9 pr-3 text-[0.8rem] text-[#111827] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#94a3b8]"
        />
      </div>

      <div className={cn("flex items-center gap-2", "ml-auto lg:ml-0")}>
        <GeoDropdown
          label="Create"
          trigger={
            <GeoButton size="sm" variant="primary" className="gap-2">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
              Create
            </GeoButton>
          }
        >
          <GeoDropdownItem asChild>
            <Link to="/studio/quizzes/new">New quiz</Link>
          </GeoDropdownItem>
          <GeoDropdownItem asChild>
            <Link to="/studio/articles/new">New article</Link>
          </GeoDropdownItem>
          <GeoDropdownItem asChild>
            <Link to="/studio/media">Upload media</Link>
          </GeoDropdownItem>
        </GeoDropdown>

        <button
          type="button"
          aria-label="Studio notifications"
          className="relative rounded-lg p-2 text-foreground/60 transition-colors hover:bg-bronze/10 hover:text-foreground"
        >
          <Bell className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.8} />
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-bronze shadow-[var(--glow-bronze)]"
          />
        </button>

        <button
          type="button"
          onClick={toggleContext}
          aria-label="Toggle context panel"
          className="hidden rounded-lg p-2 text-foreground/60 transition-colors hover:bg-bronze/10 hover:text-foreground xl:block"
        >
          <PanelRight className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.8} />
        </button>

        <Link
          to="/studio/settings"
          className="flex items-center gap-2 rounded-lg border border-bronze/15 py-1 pl-1 pr-3 transition-colors hover:border-bronze/40"
        >
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-bronze text-[0.7rem] font-semibold text-background"
          >
            {CREATOR.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </span>
          <span className="hidden text-[0.78rem] text-foreground/75 sm:block">{CREATOR.name}</span>
        </Link>
      </div>
    </header>
  );
}
