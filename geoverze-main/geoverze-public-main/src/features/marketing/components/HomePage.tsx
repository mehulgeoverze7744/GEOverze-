import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { scrollToHomeHero } from "@/lib/scrollToHomeHero";
import { HomeHero } from "./HomeHero";
import { WhyGeoverze } from "./home/WhyGeoverze";
import { Ecosystem } from "./home/Ecosystem";
import { CommunityVision } from "./home/CommunityVision";
import { GeostoreShowcase } from "./home/GeostoreShowcase";

/** Home page — the only route with the 3D globe. */
export function HomePage() {
  const historyAction = useRouterState({ select: (s) => s.historyAction });

  useEffect(() => {
    // POP = browser back/forward — TanStack scrollRestoration restores position.
    if (historyAction === "POP") {
      const timer = window.setTimeout(() => {
        void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => ScrollTrigger.refresh());
      }, 0);
      return () => window.clearTimeout(timer);
    }
    scrollToHomeHero("auto");
  }, [historyAction]);

  return (
    <>
      <HomeHero />
      <WhyGeoverze />
      <Ecosystem />
      <GeostoreShowcase />
      <CommunityVision />
    </>
  );
}
