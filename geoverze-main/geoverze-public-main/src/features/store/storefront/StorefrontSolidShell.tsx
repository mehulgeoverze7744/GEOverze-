import type { ReactNode } from "react";

import { StorefrontNav } from "./StorefrontNav";
import "./storefront.css";

/**
 * Inner Gstore pages that share the main storefront navbar.
 * Mounts StorefrontNav (wordmark, search, wishlist, cart, account) and
 * hides the global site header via #gvrze-storefront.
 */
export function StorefrontSolidShell({ children }: { children: ReactNode }) {
  return (
    <div id="gvrze-storefront" className="gvrze-gstore-orders bg-[#f5f5f5] text-[#111827]">
      <StorefrontNav variant="solid" />
      <main className="min-h-[calc(100dvh-64px)] bg-[#f5f5f5] pb-16 text-[#111827]">
        {children}
      </main>
    </div>
  );
}
