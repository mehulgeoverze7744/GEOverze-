import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  Bell,
  Bookmark,
  CalendarDays,
  Compass,
  Flame,
  Home,
  Lightbulb,
  Map,
  MessageCircle,
  Newspaper,
  Users,
  UsersRound,
} from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { SectionContainer } from "@/components/shared";
import { cn } from "@/lib/utils";

import "../community-page-light.css";
import { COMMUNITY_NOTIFICATIONS } from "../data/notifications";
import { COMMUNITY_LOCKED } from "../lib/communityLocked";
import { useCommunityStore } from "@/stores/communityStore";
import { CommunityComingSoonOverlay } from "./CommunityComingSoonOverlay";
import { CommunityPageBackground } from "./CommunityPageBackground";
import { CommunityRightRail } from "./Rails";

const NAV = [
  { label: "Community", to: "/community", icon: Home, exact: true },
  { label: "Feed", to: "/community/feed", icon: Newspaper },
  { label: "Discuss", to: "/community/discover", icon: MessageCircle },
  { label: "Maps", to: "/community/topics", icon: Map },
  { label: "Explorers", to: "/community/members", icon: Compass },
  { label: "Events", to: "/community/events", icon: CalendarDays },
  { label: "Ideas", to: "/community/topics", icon: Lightbulb },
  { label: "Challenges", to: "/community/challenges", icon: Flame },
  { label: "Groups", to: "/community/friends", icon: UsersRound },
  { label: "Saved", to: "/community/saved", icon: Bookmark },
  { label: "Notifications", to: "/community/notifications", icon: Bell },
] as const;

function ModuleNav({ compact = false }: { compact?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const read = useCommunityStore((s) => s.readNotifications);
  const unread = COMMUNITY_NOTIFICATIONS.filter((n) => !n.read && !read.includes(n.id)).length;
  const scrollerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!compact) return;
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector<HTMLElement>(".is-active");
    if (!scroller || !active) return;
    const left = active.offsetLeft - (scroller.clientWidth - active.offsetWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [compact, pathname]);

  return (
    <nav
      aria-label="Community sections"
      className={compact ? "community-module-nav-wrap" : undefined}
    >
      <ul
        ref={scrollerRef}
        className={cn(compact ? "community-module-nav" : "flex flex-col gap-0.5")}
      >
        {NAV.map((item) => {
          const active =
            "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <li key={`${item.label}-${item.to}`} className={compact ? "shrink-0" : undefined}>
              <Link
                to={item.to}
                className={cn(
                  "community-sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.68rem] uppercase tracking-[0.16em] text-[#17191D] transition-colors motion-snap",
                  compact && "whitespace-nowrap px-3 py-2",
                  active && "is-active",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0 text-[#17191D]" strokeWidth={1.5} />
                <span>{item.label}</span>
                {item.label === "Notifications" && unread > 0 ? (
                  <span className="ml-auto rounded-full bg-[#17191D] px-1.5 py-0.5 text-[0.58rem] tabular-nums text-white">
                    {unread}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "community-card overflow-hidden rounded-2xl p-4 sm:p-5",
        compact && "community-module-nav-card",
      )}
    >
      <ModuleNav compact={compact} />
      {compact ? null : (
        <div className="mt-5 rounded-xl border border-[#DDE1E5] bg-[#ECEFF2] px-4 py-4">
          <p className="flex items-start gap-2.5 text-[0.72rem] leading-relaxed text-[#737B85]">
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#17191D]" strokeWidth={1.5} />
            A global community of curious explorers.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Three-column community shell: sidebar, feed, discovery widgets.
 * The Coming Soon panel sits over the feed only.
 */
export function CommunityLayout() {
  return (
    <div id="gvrze-community-page">
      <CommunityPageBackground />
      <PageShell>
        <div className="relative">
          <SectionContainer
            size="wide"
            className="pt-[calc(var(--nav-height)+var(--space-section-sm))]"
          >
            <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px] xl:gap-6">
              <aside className="hidden min-w-0 lg:sticky lg:top-[calc(var(--nav-height)+1.25rem)] lg:block lg:self-start">
                <div
                  inert={COMMUNITY_LOCKED ? true : undefined}
                  aria-hidden={COMMUNITY_LOCKED ? true : undefined}
                  className={cn(COMMUNITY_LOCKED && "select-none")}
                >
                  <SidebarCard />
                </div>
              </aside>

              <div className="min-w-0">
                <div className="mb-5 min-w-0 max-w-full lg:hidden">
                  <SidebarCard compact />
                </div>

                <div className="relative min-h-[36rem]">
                  <div
                    inert={COMMUNITY_LOCKED ? true : undefined}
                    aria-hidden={COMMUNITY_LOCKED ? true : undefined}
                    className={cn(
                      COMMUNITY_LOCKED && "community-feed-behind select-none",
                    )}
                  >
                    <Outlet />
                  </div>

                  {COMMUNITY_LOCKED ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-10">
                      <div className="sticky top-[calc(var(--nav-height)+2.25rem)] flex justify-center px-2 pt-4 sm:pt-8">
                        <CommunityComingSoonOverlay />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div
                  className="mt-8 space-y-5 xl:hidden"
                  inert={COMMUNITY_LOCKED ? true : undefined}
                  aria-hidden={COMMUNITY_LOCKED ? true : undefined}
                >
                  <CommunityRightRail />
                </div>
              </div>

              <aside className="hidden xl:sticky xl:top-[calc(var(--nav-height)+1.25rem)] xl:block xl:self-start">
                <div
                  inert={COMMUNITY_LOCKED ? true : undefined}
                  aria-hidden={COMMUNITY_LOCKED ? true : undefined}
                  className={cn(COMMUNITY_LOCKED && "select-none")}
                >
                  <CommunityRightRail />
                </div>
              </aside>
            </div>
          </SectionContainer>
        </div>
      </PageShell>
    </div>
  );
}
