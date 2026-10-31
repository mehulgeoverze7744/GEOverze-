import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { mainNav, type NavLink } from "@/config/site";
import { signOut } from "@/lib/supabase/auth-sync";
import { cn } from "@/lib/utils";
import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";
import { selectCartCount, useCartStore } from "@/stores/cartStore";
import { selectWishlistCount, useStoreStore } from "@/stores/storeStore";

import { GeostoreSearchButton } from "../components/GeostoreSearchButton";
import { useStoreCreditsState } from "../lib/useStoreCredits";
import { SF_ASSETS } from "./storefront-assets";
import { SF_SHELL, SF_UI_FONT } from "./storefront-ui";

const ICON_BUTTON =
  "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-opacity duration-200 hover:opacity-60 motion-reduce:transition-none";

const BADGE =
  "absolute right-0.5 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold leading-none text-white";

const STORE_LINKS: { label: string; to: NavLink }[] = [
  { label: "Shop all", to: "/geostore/browse" },
  { label: "Rewards", to: "/geostore/rewards" },
  { label: "Orders", to: "/geostore/orders" },
  { label: "Wishlist", to: "/geostore/wishlist" },
  { label: "Cart", to: "/geostore/cart" },
];

const ACCOUNT_LINKS: { label: string; to: NavLink }[] = [
  { label: "Profile Dashboard", to: "/dashboard" },
  { label: "Quiz History & Rewards", to: "/quiz-history-and-rewards" },
  { label: "Bookmarks", to: "/bookmarks" },
  { label: "Settings/Support", to: "/settings" },
];

/** Drawer fonts are explicit because the sheet renders in a portal, outside the storefront scope. */
const DRAWER_FONT = "[font-family:Montserrat,ui-sans-serif,system-ui,sans-serif]";

function Icon({
  asset,
  className,
}: {
  asset: { src: string; width: number; height: number };
  className?: string;
}) {
  return (
    <img
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={className}
    />
  );
}

type StorefrontNavProps = {
  /**
   * `overlay` — homepage: fixed over the hero, transparent until scroll.
   * `solid` — inner store pages: in-flow bar so content never sits underneath.
   */
  variant?: "overlay" | "solid";
};

/**
 * Minimal storefront navigation: transparent over the hero, a light blurred bar
 * once the page scrolls. Cart, wishlist, search and account all stay wired to
 * the existing store state; the menu carries the rest of the store and site.
 */
export function StorefrontNav({ variant = "overlay" }: StorefrontNavProps) {
  const solid = variant === "solid";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useStoreStore(selectWishlistCount);
  const signedIn = useAuthStore(selectIsSignedIn);
  const { balance, authReady } = useStoreCreditsState();

  useEffect(() => {
    if (solid) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [solid]);

  const closeMenu = () => setMenuOpen(false);
  const navLink = `${SF_UI_FONT} text-[16px] text-black transition-opacity duration-200 hover:opacity-60 motion-reduce:transition-none`;

  return (
    <header
      className={cn(
        "z-40 border-b",
        solid
          ? "relative h-16 border-black/10 bg-white md:h-[72px]"
          : cn(
              "fixed inset-x-0 top-0 transition-[height,background-color,border-color] duration-300 motion-reduce:transition-none",
              scrolled
                ? "h-16 border-black/10 bg-white/90 backdrop-blur-md"
                : "h-[76px] border-transparent bg-transparent md:h-[100px]",
            ),
      )}
    >
      <div
        className={cn(
          SF_SHELL,
          "grid h-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2",
        )}
      >
        <nav
          aria-label="Gstore"
          className="hidden min-w-0 items-center gap-[clamp(16px,2.2vw,28px)] md:flex"
        >
          <Link to="/geostore/browse" className={navLink}>
            Shop
          </Link>
          {solid ? (
            <Link to="/geostore" hash="collections" className={navLink}>
              Collections
            </Link>
          ) : (
            <a href="#collections" className={navLink}>
              Collections
            </a>
          )}
          <Link
            to="/geostore/try-on"
            className={`${navLink} inline-flex items-center gap-1.5`}
            aria-label="Open Try-On Studio"
          >
            <span
              className="inline-flex h-[18px] items-center gap-1 rounded px-1.5 text-[9px] font-bold uppercase tracking-widest"
              style={{ background: "#1a1a1a", color: "#fff", letterSpacing: "0.15em" }}
              aria-hidden="true"
            >
              AI
            </span>
            Try-On Studio
          </Link>
        </nav>
        <div className="min-w-0 md:hidden" aria-hidden="true" />

        <Link
          to="/geostore"
          aria-label="Gstore home"
          className="justify-self-center rounded-sm"
        >
          <img
            src={SF_ASSETS.logo.src}
            width={SF_ASSETS.logo.width}
            height={SF_ASSETS.logo.height}
            alt="GVRZE"
            className={cn(
              "block h-auto max-w-full",
              solid ? "w-[clamp(96px,14vw,168px)]" : "w-[clamp(112px,17.6vw,253px)]",
            )}
          />
        </Link>

        <div className="flex min-w-0 items-center justify-end">
          <GeostoreSearchButton
            renderTrigger={({ onOpen }) => (
              <button
                type="button"
                onClick={onOpen}
                aria-label="Search Gstore"
                className={ICON_BUTTON}
              >
                <Icon asset={SF_ASSETS.iconSearch} />
              </button>
            )}
          />
          <Link
            to="/geostore/wishlist"
            aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : "Wishlist"}
            className={cn(ICON_BUTTON, "hidden sm:inline-flex")}
          >
            <Icon asset={SF_ASSETS.iconWishlist} />
            {wishlistCount > 0 ? (
              <span className={BADGE}>{wishlistCount > 99 ? "99+" : wishlistCount}</span>
            ) : null}
          </Link>
          <Link
            to="/geostore/cart"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            className={ICON_BUTTON}
          >
            <Icon asset={SF_ASSETS.iconCart} />
            {cartCount > 0 ? (
              <span className={BADGE}>{cartCount > 99 ? "99+" : cartCount}</span>
            ) : null}
          </Link>
          <Link
            to={signedIn ? "/dashboard" : "/auth/login"}
            aria-label={signedIn ? "Your account" : "Sign in"}
            className={cn(ICON_BUTTON, "hidden sm:inline-flex")}
          >
            <Icon asset={SF_ASSETS.iconAccount} />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            className={cn(ICON_BUTTON, "ml-0.5 w-12 rounded-lg")}
          >
            <span className="inline-flex h-[29px] w-[43px] items-center justify-center rounded-lg bg-white/50 ring-1 ring-black/5">
              <Icon asset={SF_ASSETS.iconMenu} />
            </span>
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="right"
          className={cn(
            "flex w-full flex-col gap-0 overflow-y-auto border-l border-black/10 bg-white p-0 text-black sm:max-w-sm",
            DRAWER_FONT,
          )}
        >
          <SheetHeader className="border-b border-black/10 px-7 py-6 text-left">
            <SheetTitle className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-black">
              Gstore
            </SheetTitle>
            <SheetDescription className="sr-only">Gstore, site and account links</SheetDescription>
          </SheetHeader>

          <div className="flex-1 px-7 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <nav aria-label="Gstore menu" className="flex flex-col">
              <Link
                to="/geostore/category/$slug"
                params={{ slug: "tshirts" }}
                onClick={closeMenu}
                className="border-b border-black/10 py-3.5 text-[15px] text-black"
              >
                T-Shirts
              </Link>
              <Link
                to="/geostore/category/$slug"
                params={{ slug: "hoodies" }}
                onClick={closeMenu}
                className="border-b border-black/10 py-3.5 text-[15px] text-black"
              >
                Hoodies
              </Link>
              <Link
                to="/geostore/category/$slug"
                params={{ slug: "accessories" }}
                onClick={closeMenu}
                className="border-b border-black/10 py-3.5 text-[15px] text-black"
              >
                Accessories
              </Link>
              <Link
                to="/geostore/try-on"
                onClick={closeMenu}
                className="flex items-center justify-between border-b border-black/10 py-3.5 text-[15px] text-black"
              >
                <span>Try-On Studio</span>
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
                  style={{ background: "#1a1a1a", letterSpacing: "0.15em" }}
                >
                  AI
                </span>
              </Link>
              {STORE_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className="border-b border-black/10 py-3.5 text-[15px] text-black"
                >
                  {item.label}
                  {item.to === "/geostore/cart" && cartCount > 0 ? ` (${cartCount})` : null}
                  {item.to === "/geostore/wishlist" && wishlistCount > 0
                    ? ` (${wishlistCount})`
                    : null}
                </Link>
              ))}
            </nav>

            <p className="mt-8 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/50">
              GVRZE
            </p>
            <nav aria-label="GVRZE site" className="mt-2 flex flex-col">
              {mainNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className="border-b border-black/10 py-3.5 text-[15px] text-black"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <p className="mt-8 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/50">
              Account
            </p>
            {signedIn ? (
              <>
                {authReady && balance !== null ? (
                  <Link
                    to="/play/credit-history"
                    onClick={closeMenu}
                    className="mt-2 flex items-center justify-between border-b border-black/10 py-3.5 text-[15px] text-black"
                  >
                    <span>Credits</span>
                    <span className="font-semibold">{balance}</span>
                  </Link>
                ) : null}
                <nav aria-label="Account" className="flex flex-col">
                  {ACCOUNT_LINKS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={closeMenu}
                      className="border-b border-black/10 py-3.5 text-[15px] text-black"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    void signOut();
                  }}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-black/20 text-[14px] font-medium text-black transition-colors hover:bg-black hover:text-white"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                <Link
                  to="/auth/login"
                  onClick={closeMenu}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-black/20 text-[14px] font-medium text-black transition-colors hover:bg-black hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth/signup"
                  onClick={closeMenu}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#1a1a1a] text-[14px] font-medium text-white transition-colors hover:bg-black"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
