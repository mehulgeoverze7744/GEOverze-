import type { NavItem } from "@/config/site";

export type HomeFeature = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  to: NavItem["to"];
  imagePosition?: string;
};

/** WHY GVRZE — light photo cards for every major GVRZE page. */
export const whyCarouselCards: HomeFeature[] = [
  {
    title: "Home",
    description: "Discover the GVRZE universe and begin your exploration.",
    imageSrc: "/assets/home/pages/home.jpg",
    imageAlt: "Pale-blue Earth horizon with a softly lit moon",
    to: "/",
  },
  {
    title: "Let's Play",
    description: "Explore geography through interactive quizzes, challenges and tournaments.",
    imageSrc: "/assets/home/pages/lets-play.jpg",
    imageAlt: "Tablet showing a world map quiz on a bright desk",
    to: "/play",
  },
  {
    title: "GVRZE Library",
    description: "Discover countries, capitals, flags, cultures and geographical knowledge.",
    imageSrc: "/assets/home/pages/library.jpg",
    imageAlt: "Open atlas, globe and maps on a sunlit table",
    to: "/geolibrary",
  },
  {
    title: "GStore",
    description: "Explore GVRZE merchandise, collections and rewards.",
    imageSrc: "/assets/home/pages/gstore.jpg",
    imageAlt: "Geography apparel and a world-map mug in a bright studio",
    to: "/geostore",
  },
  {
    title: "Community",
    description: "Connect with explorers and participate in the global geography community.",
    imageSrc: "/assets/home/pages/community.jpg",
    imageAlt: "People gathered around a world map in a bright room",
    to: "/community",
  },
  {
    title: "Leaderboard",
    description: "Track rankings, achievements and competitive progress.",
    imageSrc: "/assets/home/pages/leaderboard.jpg",
    imageAlt: "Minimal stone podiums with a small globe in a white interior",
    to: "/leaderboard",
  },
  {
    title: "Pricing / Membership",
    description: "Discover membership tiers and unlock premium experiences.",
    imageSrc: "/assets/home/pages/pricing.jpg",
    imageAlt: "Premium membership card and compass pin on white linen",
    to: "/pricing",
  },
  {
    title: "Profile Dashboard",
    description: "Track your progress, quiz history, rewards, bookmarks and achievements.",
    imageSrc: "/assets/home/pages/dashboard.jpg",
    imageAlt: "Laptop on a white desk showing a light progress dashboard",
    to: "/dashboard",
  },
];

/**
 * THE ECOSYSTEM — six editorial images representing the GVRZE platform.
 */
export const ecosystem: HomeFeature[] = [
  {
    title: "Home",
    description: "Discover the GVRZE universe and begin your exploration.",
    imageSrc: "/assets/home/ecosystem/visual-home.jpg",
    imageAlt: "Earth from orbit with a glowing blue atmosphere",
    imagePosition: "center 58%",
    to: "/",
  },
  {
    title: "Let's Play",
    description: "Play interactive geography quizzes, challenges and tournaments.",
    imageSrc: "/assets/home/ecosystem/visual-play.jpg",
    imageAlt: "Glowing world map with geography challenge markers",
    imagePosition: "center 42%",
    to: "/play",
  },
  {
    title: "GVRZE Library",
    description: "Explore countries, capitals, flags, cultures and geographical knowledge.",
    imageSrc: "/assets/home/ecosystem/visual-library.jpg",
    imageAlt: "Globe, open atlas and geography books on a marble desk",
    imagePosition: "center 52%",
    to: "/geolibrary",
  },
  {
    title: "GStore",
    description: "Discover GVRZE merchandise, apparel and exclusive collections.",
    imageSrc: "/assets/home/ecosystem/visual-gstore.jpg",
    imageAlt: "Black GVRZE t-shirt and hoodies with geographical artwork in a dark studio",
    imagePosition: "center 42%",
    to: "/geostore",
  },
  {
    title: "Community",
    description: "Connect with explorers and share your passion for geography.",
    imageSrc: "/assets/home/ecosystem/visual-community.jpg",
    imageAlt: "Explorers collaborating over a world map",
    imagePosition: "center 38%",
    to: "/community",
  },
  {
    title: "Pricing / Membership",
    description: "Unlock premium features and expand your exploration.",
    imageSrc: "/assets/home/ecosystem/visual-membership.jpg",
    imageAlt: "Matte black membership card with gold globe and compass details",
    imagePosition: "center 48%",
    to: "/pricing",
  },
];
