import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  CalendarDays,
  Compass,
  Flame,
  Hash,
  Home,
  Search,
  Users,
  UserPlus,
} from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { SectionContainer } from "@/components/shared";
import { cn } from "@/lib/utils";

import { COMMUNITY_NOTIFICATIONS } from "../data/notifications";
import { COMMUNITY_LOCKED } from "../lib/communityLocked";
import { useCommunityStore } from "@/stores/communityStore";
import { CommunityComingSoonOverlay } from "./CommunityComingSoonOverlay";
import { CommunityLeftRail, CommunityRightRail } from "./Rails";

const NAV = [
  { label: "Community", to: "/community", icon: Home, exact: true },
  { label: "Feed", to: "/community/feed", icon: Compass },
  { label: "Discover", to: "/community/discover", icon: Search },
  { label: "Topics", to: "/community/topics", icon: Hash },
  { label: "Explorers", to: "/community/members", icon: Users },
  { label: "Friends", to: "/community/friends", icon: UserPlus },
  { label: "Challenges", to: "/community/challenges", icon: Flame },
  { label: "Events", to: "/community/events", icon: CalendarDays },
  { label: "Saved", to: "/community/saved", icon: Bookmark },
  { label: "Notifications", to: "/community/notifications", icon: Bell },
] as const;

function ModuleNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const read = useCommunityStore((s) => s.readNotifications);
  const unread = COMMUNITY_NOTIFICATIONS.filter((n) => !n.read && !read.includes(n.id)).length;

  return (
    <nav aria-label="Community sections" className="-mx-6 overflow-x-auto px-6 lg:mx-0 lg:px-0">
      <ul className="flex gap-1.5 lg:flex-col">
        {NAV.map((item) => {
          const active =
            "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <li key={item.to} className="shrink-0 lg:shrink">
              <Link
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-[0.7rem] uppercase tracking-[0.14em] transition-[color,border-color] motion-snap lg:rounded-xl",
                  active
                    ? "border-bronze/50 bg-bronze/10 text-bronze-glow"
                    : "border-transparent text-foreground/50 hover:border-bronze/25 hover:text-foreground/85",
                )}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <span className="truncate">{item.label}</span>
                {item.label === "Notifications" && unread > 0 ? (
                  <span className="ml-auto rounded-full bg-bronze/20 px-1.5 text-[0.6rem] tabular-nums text-bronze-glow">
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

/**
 * Three-column community shell: module nav, page content, discovery rail.
 * Rails collapse below the content on narrow viewports.
 */
export function CommunityLayout() {
  return (
    <PageShell>
      <div className="relative">
        <SectionContainer
          size="wide"
          inert={COMMUNITY_LOCKED ? true : undefined}
          aria-hidden={COMMUNITY_LOCKED ? true : undefined}
          className={cn(
            "pt-[calc(var(--nav-height)+var(--space-section-sm))]",
            COMMUNITY_LOCKED && "select-none",
          )}
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,320px)]">
            <aside className="min-w-0 lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)] lg:self-start">
              <ModuleNav />
            </aside>

            <div className="min-w-0">
              <Outlet />
              <div className="mt-8 space-y-5 xl:hidden">
                <CommunityLeftRail />
                <CommunityRightRail />
              </div>
            </div>

            <aside className="hidden xl:sticky xl:top-[calc(var(--nav-height)+1.5rem)] xl:block xl:self-start">
              <div className="space-y-5">
                <CommunityLeftRail />
                <CommunityRightRail />
              </div>
            </aside>
          </div>
        </SectionContainer>

        {COMMUNITY_LOCKED ? <CommunityComingSoonOverlay /> : null}
      </div>
    </PageShell>
  );
}
