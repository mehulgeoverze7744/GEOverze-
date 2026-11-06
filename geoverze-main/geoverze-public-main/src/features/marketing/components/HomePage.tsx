import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { scrollToHomeHero } from "@/lib/scrollToHomeHero";
import { HomeHero } from "./HomeHero";
import { WhyGeoverze } from "./home/WhyGeoverze";
import { Ecosystem } from "./home/Ecosystem";
import { CommunityVision } from "./home/CommunityVision";
import { GeostoreShowcase } from "./home/GeostoreShowcase";
import "./home-lunar.css";

/** Home page — the only route with the 3D globe. */
export function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const historyAction = useRouterState({ select: (s) => (s as any).historyAction as string | undefined });

  useEffect(() => {
    // POP = browser back/forward — TanStack scrollRestoration restores position.
    if (historyAction === "POP") {
      const timer = window.setTimeout(() => {
        void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => ScrollTrigger.refresh());
      }, 0);
      return () => window.clearTimeout(timer);
    }
    scrollToHomeHero("auto");
    return undefined;
  }, [historyAction]);

  return (
    <div id="gvrze-home">
      <div className="gvrze-home-sky" aria-hidden="true" />
      <HomeHero />
      <div className="gvrze-home-below">
        <WhyGeoverze />
        <Ecosystem />
        <GeostoreShowcase />
        <CommunityVision />
      </div>
    </div>
  );
}
