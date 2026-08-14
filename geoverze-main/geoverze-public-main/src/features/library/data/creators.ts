/**
 * GEOlibrary creators.
 *
 * Placeholder authors for every article. Follower and like counts are
 * illustrative; the verified marker is a design placeholder until creator
 * verification ships with the backend.
 */

export type Creator = {
  handle: string;
  name: string;
  role: string;
  bio: string;
  /** Procedural art key for the avatar and banner. */
  art: string;
  verified: boolean;
  followers: number;
  likes: number;
  /** Slug of the collection shown as their featured shelf. */
  featuredCollection: string;
  location: string;
  joinedAt: string;
};

export const CREATORS: readonly Creator[] = [
  {
    handle: "atlas-studio",
    name: "Atlas Studio",
    role: "Cartography collective",
    bio: "A three-person studio drawing bronze relief plates and writing the notes that go with them. Obsessed with borders, coastlines and the stories behind survey lines.",
    art: "creator-atlas-studio",
    verified: true,
    followers: 18_420,
    likes: 92_180,
    featuredCollection: "countries-of-europe",
    location: "Lisbon, Portugal",
    joinedAt: "2024-03-11",
  },
  {
    handle: "meridian",
    name: "Meridian",
    role: "Physical geographer",
    bio: "Writes about mountains, plates and the slow machinery of the planet. Former field surveyor, current explainer of things that take a million years.",
    art: "creator-meridian",
    verified: true,
    followers: 12_060,
    likes: 61_340,
    featuredCollection: "mountain-ranges",
    location: "Innsbruck, Austria",
    joinedAt: "2024-06-02",
  },
  {
    handle: "delta-notes",
    name: "Delta Notes",
    role: "Hydrology writer",
    bio: "Rivers, deltas, basins and the politics of water. If it flows downhill, there is probably an article about it here.",
    art: "creator-delta-notes",
    verified: false,
    followers: 7_940,
    likes: 33_510,
    featuredCollection: "great-rivers",
    location: "Dhaka, Bangladesh",
    joinedAt: "2025-01-19",
  },
  {
    handle: "terra-lingua",
    name: "Terra Lingua",
    role: "Culture & language desk",
    bio: "Language families, scripts, currencies and the everyday culture that maps rarely show. Written with linguists, checked by travellers.",
    art: "creator-terra-lingua",
    verified: true,
    followers: 9_275,
    likes: 40_870,
    featuredCollection: "geography-basics",
    location: "Nairobi, Kenya",
    joinedAt: "2024-11-08",
  },
  {
    handle: "heritage-desk",
    name: "Heritage Desk",
    role: "UNESCO correspondent",
    bio: "Documenting protected places, why they earned protection and what still threatens them. One site at a time, in plain language.",
    art: "creator-heritage-desk",
    verified: false,
    followers: 5_610,
    likes: 21_930,
    featuredCollection: "unesco-heritage",
    location: "Kyoto, Japan",
    joinedAt: "2025-04-27",
  },
] as const;

const BY_HANDLE = new Map(CREATORS.map((c) => [c.handle, c]));

export const creatorByHandle = (handle: string): Creator | undefined => BY_HANDLE.get(handle);
