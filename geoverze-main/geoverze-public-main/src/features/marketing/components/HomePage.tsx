import { HomeHero } from "./HomeHero";
import { WhyGeoverze } from "./home/WhyGeoverze";
import { Compete } from "./home/Compete";
import { Ecosystem } from "./home/Ecosystem";
import { WhyChoose } from "./home/WhyChoose";
import { CommunityVision } from "./home/CommunityVision";
import { GeostoreShowcase } from "./home/GeostoreShowcase";
import { FinalCta } from "./home/FinalCta";

/** Home page — the only route with the 3D globe. */
export function HomePage() {
  return (
    <>
      <HomeHero />
      <WhyGeoverze />
      <Compete />
      <Ecosystem />
      <WhyChoose />
      <CommunityVision />
      <GeostoreShowcase />
      <FinalCta />
    </>
  );
}
