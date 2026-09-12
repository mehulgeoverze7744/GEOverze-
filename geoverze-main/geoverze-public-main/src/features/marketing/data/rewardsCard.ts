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
    imagePosition: "center center",
  },
  {
    id: "ps5",
    title: "PS5",
    image: "/assets/rewards/ps5.jpg",
    imageAlt: "PlayStation 5 console and DualSense controller",
    imagePosition: "62% center",
  },
  {
    id: "merch",
    title: "Exclusive GEOverze Merchandise",
    image: "/assets/rewards/geoverze-merchandise.jpg",
    imageAlt: "Exclusive GEOverze hoodies and branded merchandise collection",
    imagePosition: "center 58%",
  },
];
