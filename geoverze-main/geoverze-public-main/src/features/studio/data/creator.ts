/** The signed-in creator. Placeholder profile until accounts are real. */

export type CreatorProfile = {
  name: string;
  handle: string;
  role: string;
  bio: string;
  location: string;
  joinedAt: string;
  verified: boolean;
  verificationStage: "unverified" | "submitted" | "verified";
  avatarKey: string;
  languages: string[];
  specialities: string[];
  social: { label: string; url: string }[];
  payout: {
    method: string;
    detail: string;
    currency: string;
    connected: boolean;
  };
};

export const CREATOR: CreatorProfile = {
  name: "Amara Okoye",
  handle: "amaraokoye",
  role: "Verified creator · Geography educator",
  bio: "I write about coastlines, borders and the stories behind maps. Twelve years teaching physical geography, now building quizzes for the GEOverze universe.",
  location: "Lagos, Nigeria",
  joinedAt: "2024-11-02",
  verified: true,
  verificationStage: "verified",
  avatarKey: "creator-amara",
  languages: ["English", "French"],
  specialities: ["Physical geography", "Cartography", "African studies"],
  social: [
    { label: "Website", url: "https://example.com/amara" },
    { label: "X", url: "https://x.com/example" },
    { label: "YouTube", url: "https://youtube.com/@example" },
  ],
  payout: {
    method: "Bank transfer",
    detail: "•••• 4417 · NGN account",
    currency: "USD",
    connected: false,
  },
};

/** Categories the studio can assign content to. */
export const STUDIO_CATEGORIES = [
  { id: "flags", label: "Flags & emblems" },
  { id: "capitals", label: "Capitals & cities" },
  { id: "physical", label: "Physical geography" },
  { id: "borders", label: "Borders & territories" },
  { id: "climate", label: "Climate & weather" },
  { id: "oceans", label: "Oceans & rivers" },
  { id: "culture", label: "Culture & people" },
  { id: "economy", label: "Economy & trade" },
] as const;

export function categoryLabel(id: string): string {
  return STUDIO_CATEGORIES.find((c) => c.id === id)?.label ?? "Uncategorised";
}
