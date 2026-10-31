import { BookOpen, Compass, Globe, MessageCircle, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { GeoButton } from "@/components/shared";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: MessageCircle, label: "Discuss" },
  { icon: Users, label: "Connect" },
  { icon: BookOpen, label: "Learn" },
  { icon: Compass, label: "Explore" },
] as const;

function CompassStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={cn("h-3 w-3 shrink-0 text-[#17191D]", className)}
    >
      <path
        d="M8 1.5 9.1 6.9 14.5 8 9.1 9.1 8 14.5 6.9 9.1 1.5 8 6.9 6.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Coming Soon panel locked over the Community feed. Sidebar and widgets stay
 * readable; only the feed behind this card is blurred.
 */
export function CommunityComingSoonOverlay() {
  const reducedMotion = useReducedMotion();
  const signedIn = useAuthStore(selectIsSignedIn);

  return (
    <div
      role="region"
      aria-label="Community coming soon"
      className={cn(
        "community-coming-soon pointer-events-auto relative w-full max-w-[26rem] overflow-hidden rounded-[1.75rem] border border-[#DDE1E5] bg-[rgb(255_255_255_/_0.94)] px-7 py-8 text-center shadow-[0_18px_48px_-28px_rgb(23_25_29_/_0.45)] backdrop-blur-md sm:max-w-[30rem] sm:px-11 sm:py-10",
        !reducedMotion && "animate-in fade-in zoom-in-95 duration-500",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 50% 0%, #c8d8e5 0%, transparent 62%),
            url(/assets/gvrze-geography-light-bg.jpg)
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <Globe
          aria-hidden
          className="h-8 w-8 text-[#17191D] sm:h-9 sm:w-9"
          strokeWidth={1.25}
        />

        <h1 className="mt-5 font-bold uppercase leading-[0.86] tracking-[0.16em] text-[#17191D] text-[clamp(2.8rem,7.4vw,4.6rem)]">
          Coming
          <br />
          Soon
        </h1>

        <div className="mt-6 max-w-sm space-y-1 text-[0.95rem] leading-relaxed text-[#737B85] sm:text-base">
          <p>The GVRZE community is taking shape.</p>
          <p>Stay tuned.</p>
        </div>

        <div className="mt-8">
          <GeoButton
            asChild
            variant="solid"
            size="lg"
            className="min-h-11 min-w-[11.5rem] rounded-full bg-[#17191D] px-10 font-semibold uppercase tracking-[0.22em] text-white shadow-none"
          >
            {signedIn ? (
              <Link to="/app/settings" search={{ section: "notifications" }}>
                Notify me
              </Link>
            ) : (
              <Link to="/auth/login" search={{ redirect: "/community" }}>
                Notify me
              </Link>
            )}
          </GeoButton>
        </div>

        <div aria-hidden className="mt-9 flex w-full max-w-xs items-center gap-3">
          <div className="h-px flex-1 bg-[#DDE1E5]" />
          <CompassStar />
          <div className="h-px flex-1 bg-[#DDE1E5]" />
        </div>

        <div className="mt-8 hidden w-full items-start justify-between gap-2 sm:flex">
          {FEATURES.map((feature) => (
            <div key={feature.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <feature.icon
                aria-hidden
                className="h-[1.05rem] w-[1.05rem] text-[#17191D]"
                strokeWidth={1.4}
              />
              <span className="text-[0.58rem] uppercase tracking-[0.28em] text-[#17191D]">
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 grid w-full grid-cols-2 gap-x-6 gap-y-5 sm:hidden">
          {FEATURES.map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-2">
              <feature.icon
                aria-hidden
                className="h-4 w-4 text-[#17191D]"
                strokeWidth={1.4}
              />
              <span className="text-[0.58rem] uppercase tracking-[0.26em] text-[#17191D]">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
