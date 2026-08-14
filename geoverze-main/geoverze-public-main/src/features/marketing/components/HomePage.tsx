import { HomeHero } from "./HomeHero";
import { WhyGeoverze } from "./home/WhyGeoverze";
import { ExploreWorld } from "./home/ExploreWorld";
import { LearnThroughPlay } from "./home/LearnThroughPlay";
import { Compete } from "./home/Compete";
import { Ecosystem } from "./home/Ecosystem";
import { WhyChoose } from "./home/WhyChoose";
import { CommunityVision } from "./home/CommunityVision";
import { FinalCta } from "./home/FinalCta";

/** Home page — the only route with the 3D globe. */
export function HomePage() {
  return (
    <>
      <HomeHero />
      <WhyGeoverze />
      <ExploreWorld />
      <LearnThroughPlay />
      <Compete />
      <Ecosystem />
      <WhyChoose />
      <CommunityVision />
      <FinalCta />
    </>
  );
}
