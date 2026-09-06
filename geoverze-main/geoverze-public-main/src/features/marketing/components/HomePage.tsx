import { HomeHero } from "./HomeHero";
import { WhyGeoverze } from "./home/WhyGeoverze";
import { Ecosystem } from "./home/Ecosystem";
import { CommunityVision } from "./home/CommunityVision";
import { GeostoreShowcase } from "./home/GeostoreShowcase";

/** Home page — the only route with the 3D globe. */
export function HomePage() {
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
