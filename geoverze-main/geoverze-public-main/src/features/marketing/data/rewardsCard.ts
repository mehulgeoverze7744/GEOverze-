import type { NavItem } from "@/config/site";

export type HeroRewardItem = {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  /** object-position for cover-fit inside the reward slot */
  imagePosition?: string;
  /** When set, the whole tile navigates here instead of the rewards catalogue. */
  to?: NavItem["to"];
};

/** Monthly hero reward tiles — native HD sources, no downscaled thumbnails. */
export const HERO_REWARDS: HeroRewardItem[] = [
  {
    id: "iphone",
    title: "iPhone Duo",
    image: "/assets/rewards/iphone-duo.jpg",
    imageAlt: "Two premium iPhones in a product display",
    imageWidth: 1024,
    imageHeight: 576,
    imagePosition: "center 42%",
  },
  {
    id: "ps5",
    title: "PlayStation",
    image: "/assets/rewards/ps5.jpg",
    imageAlt: "PlayStation 5 console and DualSense controller",
    imageWidth: 1024,
    imageHeight: 576,
    imagePosition: "70% center",
  },
  {
    id: "fashion",
    title: "GVRZE Fashion",
    image: "/assets/rewards/gvrze-fashion.jpg",
    imageAlt: "Black GVRZE T-shirts, hoodies and caps from the GVRZE Fashion collection",
    imageWidth: 1280,
    imageHeight: 720,
    imagePosition: "center 50%",
    to: "/geostore",
  },
];
