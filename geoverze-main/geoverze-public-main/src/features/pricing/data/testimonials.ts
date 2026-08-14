export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  plan: string;
  stat: string;
};

/** Illustrative only — no real members exist yet. */
export const testimonials: Testimonial[] = [
  {
    id: "creator",
    quote:
      "I wrote a series on monsoon systems on a Sunday and watched it reach classrooms in four countries by Friday. The Studio made it feel like publishing, not posting.",
    name: "Ilaria Vance",
    role: "Creator, climate systems",
    plan: "Advance",
    stat: "38 quizzes published",
  },
  {
    id: "explorer",
    quote:
      "I went from guessing at capitals to reading coastlines. The mastery map showed me exactly which continent I was avoiding.",
    name: "Daniel Okoye",
    role: "Explorer, three-month streak",
    plan: "Pro",
    stat: "Level 24 · 96 day streak",
  },
  {
    id: "member",
    quote:
      "The duels are the part I did not expect to love. Two minutes, real opponents, and geography suddenly has stakes.",
    name: "Mira Halvorsen",
    role: "Premium member",
    plan: "Pro",
    stat: "Top 2% global standing",
  },
];
