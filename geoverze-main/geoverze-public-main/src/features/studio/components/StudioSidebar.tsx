import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight, ExternalLink } from "lucide-react";

import { BrandMark } from "@/components/shared/BrandMark";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/stores/studioStore";
import { STUDIO_NAV } from "../data/workspace";

/**
 * Left workspace rail. Professional first: dense, quiet, icon-collapsible.
 * Never disappears — collapsing leaves a narrow icon strip.
 */
export function StudioSidebar() {
  const collapsed = useStudioStore((s) => s.sidebarCollapsed);
  const toggle = useStudioStore((s) => s.toggleSidebar);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <aside
      aria-label="Creator Studio navigation"
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-bronze/12 bg-[oklch(0.145_0.006_60/0.92)] backdrop-blur-xl transition-[width] motion-fast md:flex",
        collapsed ? "w-[4.5rem]" : "w-[15.5rem]",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-bronze/12",
          collapsed ? "justify-center px-2" : "gap-3 px-5",
        )}
      >
        <Link to="/" className="flex items-center gap-3" aria-label="GEOverze home">
          <BrandMark className="h-8 w-8" />
          {!collapsed ? (
            <span className="flex flex-col leading-none">
              <span className="text-[0.82rem] font-semibold tracking-tight text-foreground">
                Creator Studio
              </span>
              <span className="mt-1 text-[0.62rem] uppercase tracking-[0.2em] text-bronze/90">
                GEOverze
              </span>
            </span>
          ) : null}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto rail-scroll px-2 py-4">
        {STUDIO_NAV.map((group) => (
          <div key={group.id} className="mb-5">
            {!collapsed ? (
              <p className="mb-2 px-3 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-foreground/50">
                {group.label}
              </p>
            ) : (
              <div className="mx-3 mb-2 h-px bg-bronze/10" aria-hidden />
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.to, item.exact);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group flex items-center rounded-lg text-[0.82rem] transition-colors motion-fast",
                        collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
                        active
                          ? "bg-bronze/12 text-bronze-glow"
                          : "text-foreground/60 hover:bg-bronze/[0.07] hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-[1.05rem] w-[1.05rem] shrink-0" strokeWidth={1.8} />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      {!collapsed && active ? (
                        <span
                          aria-hidden
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-bronze shadow-[var(--glow-bronze)]"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-bronze/12 p-2">
        {!collapsed ? (
          <Link
            to="/geolibrary"
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-[0.78rem] text-foreground/50 transition-colors hover:text-bronze"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
            <span>View public profile</span>
          </Link>
        ) : null}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center rounded-lg py-2 text-[0.78rem] text-foreground/50 transition-colors hover:bg-bronze/[0.07] hover:text-foreground",
            collapsed ? "justify-center" : "gap-3 px-3",
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" strokeWidth={1.8} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
