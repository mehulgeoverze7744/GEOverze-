import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  BookMarked,
  LayoutDashboard,
  History,
  LifeBuoy,
  LogIn,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/shared/BrandMark";
import { GeoButton } from "@/components/shared/GeoButton";
import { GeoDrawer } from "@/components/shared/GeoDrawer";
import { GeoDropdown, GeoDropdownItem } from "@/components/shared/GeoDropdown";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { mainNav, site } from "@/config/site";
import { signOut } from "@/lib/supabase/auth-sync";
import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

const accountLinks = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Progress", to: "/progress", icon: TrendingUp },
  { label: "Quiz history", to: "/quiz-history", icon: History },
  { label: "Achievements and Rewards", to: "/achievements", icon: Award },
  { label: "Bookmarks", to: "/bookmarks", icon: BookMarked },

  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Support", to: "/support", icon: LifeBuoy },
] as const;

/**
 * Transparent over the universe, glassmorphic once scrolled.
 * Scroll state is written to a data attribute from a passive listener so the
 * navbar never re-renders while scrolling.
 */
export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signedIn = useAuthStore(selectIsSignedIn);
  const navigate = useNavigate();

  const handleSignOut = () => {
    setOpen(false);
    void signOut().then(() => navigate({ to: "/" }));
  };

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      node.dataset["scrolled"] = window.scrollY > 24 ? "true" : "false";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Close the drawer whenever navigation happens.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      ref={headerRef}
      data-scrolled="false"
      className="group fixed inset-x-0 top-0 z-50 h-[var(--nav-height)] border-b border-transparent transition-all motion-base data-[scrolled=true]:glass-panel data-[scrolled=true]:rounded-none data-[scrolled=true]:shadow-[var(--shadow-float)]"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-6 md:px-10">
        <Link
          to="/"
          aria-label={`${site.name} home`}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
        >
          <BrandMark size="md" withWordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="text-[0.7rem] uppercase tracking-[0.26em] text-foreground/50 transition-colors motion-fast hover:text-bronze focus-visible:outline-none focus-visible:text-bronze data-[status=active]:text-bronze"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <GlobalSearch />
          <NotificationBell />
          <GeoDropdown
            label="Account"
            trigger={
              <button
                type="button"
                aria-label="Account menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bronze/25 bg-bronze/5 text-bronze/90 transition-colors motion-fast hover:border-bronze/50 hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
              >
                <User className="h-4 w-4" strokeWidth={1.5} />
              </button>
            }
          >
            {signedIn ? (
              <>
                {accountLinks.map((item) => (
                  <GeoDropdownItem key={item.to} asChild>
                    <Link to={item.to} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  </GeoDropdownItem>
                ))}
                <GeoDropdownItem
                  onSelect={handleSignOut}
                  className="mt-1 border-t border-bronze/12 pt-3 text-bronze/90"
                >
                  <span className="flex items-center gap-3">
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    Sign out
                  </span>
                </GeoDropdownItem>
              </>
            ) : (
              <GeoDropdownItem asChild className="text-bronze/90">
                <Link to="/auth/login" className="flex items-center gap-3">
                  <LogIn className="h-4 w-4" strokeWidth={1.5} />
                  Sign in
                </Link>
              </GeoDropdownItem>
            )}
          </GeoDropdown>
          {signedIn ? null : (
            <GeoButton asChild variant="primary" size="sm">
              <Link to="/auth/signup">Get Started</Link>
            </GeoButton>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <GlobalSearch />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bronze/25 text-bronze transition-colors motion-fast hover:border-bronze/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <GeoDrawer
        open={open}
        onOpenChange={setOpen}
        title="Navigate"
        description="Everywhere the universe reaches."
        className="w-full sm:max-w-sm"
      >
        <nav aria-label="Site" className="flex flex-col">
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="border-b border-bronze/10 py-4 text-sm uppercase tracking-[0.24em] text-foreground/70 transition-colors hover:text-bronze focus-visible:outline-none focus-visible:text-bronze data-[status=active]:text-bronze"
            >
              {item.label}
            </Link>
          ))}
          {signedIn
            ? accountLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 border-b border-bronze/10 py-4 text-sm text-foreground/50 transition-colors hover:text-bronze"
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  {item.label}
                </Link>
              ))
            : null}
        </nav>

        <div className="mt-8 flex flex-col gap-3">
          {signedIn ? (
            <GeoButton
              variant="secondary"
              size="lg"
              className="w-full gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Sign out
            </GeoButton>
          ) : (
            <>
              <GeoButton asChild variant="secondary" size="lg" className="w-full">
                <Link to="/auth/login">Sign in</Link>
              </GeoButton>
              <GeoButton asChild variant="primary" size="lg" className="w-full">
                <Link to="/auth/signup">Get Started</Link>
              </GeoButton>
            </>
          )}
        </div>
      </GeoDrawer>
    </header>
  );
}
