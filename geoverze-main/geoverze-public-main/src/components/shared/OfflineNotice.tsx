import { WifiOff } from "lucide-react";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Sitewide offline banner. Rendered once in the root shell so every route
 * inherits the same connectivity feedback.
 */
export function OfflineNotice() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[var(--z-toast)] flex items-center justify-center gap-3 border-t border-bronze/25 bg-charcoal/95 px-5 py-3 text-center text-xs text-foreground/70 backdrop-blur"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-bronze" strokeWidth={1.5} aria-hidden />
      <span>You're offline — GEOverze will reconnect automatically.</span>
    </div>
  );
}
