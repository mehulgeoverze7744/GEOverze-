export type HeroRewardItem = {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  /** object-position for cover-fit inside the reward slot */
  imagePosition?: string;
};

/** Monthly hero reward tiles — overlaid on the approved bronze card artwork. */
export const HERO_REWARDS: HeroRewardItem[] = [
  {
    id: "iphone",
    title: "iPhone Duo",
    image: "/assets/rewards/iphone-duo.jpg",
    imageAlt: "Two premium iPhones in a product display",
    imagePosition: "center 42%",
  },
  {
    id: "ps5",
    title: "PlayStation",
    image: "/assets/rewards/ps5.jpg",
    imageAlt: "PlayStation 5 console and DualSense controller",
    imagePosition: "70% center",
  },
  {
    id: "merch",
    title: "Exclusive GVRZE Merchandise",
    image: "/assets/rewards/gvrze-merchandise.jpg",
    imageAlt: "Exclusive GVRZE hoodies and branded merchandise collection",
    imagePosition: "center 58%",
  },
];
