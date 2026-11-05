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
 * THE ECOSYSTEM — six light photographic cards for the main GVRZE pages.
 * Images are real Unsplash/Pexels photographs (free commercial licenses).
 */
export const ecosystem: HomeFeature[] = [
  {
    title: "Home",
    description: "Discover the GVRZE universe and begin your exploration.",
    imageSrc: "/assets/home/ecosystem/home-map.jpg",
    imageAlt: "Traveler reading a paper map in bright daylight",
    imagePosition: "center 42%",
    to: "/",
  },
  {
    title: "Let's Play",
    description: "Play interactive geography quizzes, challenges and tournaments.",
    imageSrc: "/assets/home/ecosystem/play-collab.jpg",
    imageAlt: "Friends collaborating over laptops at a sunlit table",
    imagePosition: "center 32%",
    to: "/play",
  },
  {
    title: "GVRZE Library",
    description: "Explore countries, capitals, flags, cultures and geographical knowledge.",
    imageSrc: "/assets/home/ecosystem/library-shelves.jpg",
    imageAlt: "Curved wooden bookshelves in a bright public library",
    imagePosition: "center center",
    to: "/geolibrary",
  },
  {
    title: "GStore",
    description: "Discover GVRZE merchandise, apparel and exclusive collections.",
    imageSrc: "/assets/home/ecosystem/apparel.jpg",
    imageAlt: "Apparel and accessories arranged in a clean clothing boutique",
    imagePosition: "center center",
    to: "/geostore",
  },
  {
    title: "Community",
    description: "Connect with explorers and share your passion for geography.",
    imageSrc: "/assets/home/ecosystem/community-together.jpg",
    imageAlt: "Friends standing together by the water with arms around each other",
    imagePosition: "center 46%",
    to: "/community",
  },
  {
    title: "Pricing / Membership",
    description: "Unlock premium features and expand your exploration.",
    imageSrc: "/assets/home/ecosystem/membership.jpg",
    imageAlt: "Bright premium workspace with a laptop beside floor-to-ceiling windows",
    imagePosition: "center center",
    to: "/pricing",
  },
];
