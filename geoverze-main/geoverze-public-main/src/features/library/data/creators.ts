/**
 * Official GVRZE Library creator.
 *
 * The public Library credits one editorial team. Older placeholder handles
 * remain only so existing links can resolve to this profile. They are not
 * displayed as people.
 */

export type Creator = {
  handle: string;
  name: string;
  role: string;
  bio: string;
  /** Procedural art key. The official profile uses the GVRZE emblem instead. */
  art: string;
  verified: boolean;
  followers: number;
  likes: number;
  /** Slug of the collection shown as their featured shelf. */
  featuredCollection: string;
  location: string;
  joinedAt: string;
};

export const GVRZE_STUDIO_HANDLE = "gvrze-studio";

/** Placeholder handles that used to appear as separate Library authors. */
export const LEGACY_LIBRARY_CREATOR_HANDLES = [
  "atlas-studio",
  "meridian",
  "delta-notes",
  "terra-lingua",
  "heritage-desk",
] as const;

export const GVRZE_STUDIO: Creator = {
  handle: GVRZE_STUDIO_HANDLE,
  name: "GVRZE Studio",
  role: "Official GVRZE Library Creator",
  bio: "The official editorial team behind GVRZE Library, creating and curating geography articles, maps, cultural insights, and educational resources.",
  art: "gvrze-emblem",
  verified: true,
  followers: 0,
  likes: 0,
  featuredCollection: "",
  location: "Mumbai, India",
  joinedAt: "",
};

export const CREATORS: readonly Creator[] = [GVRZE_STUDIO];

const BY_HANDLE = new Map(CREATORS.map((creator) => [creator.handle, creator]));

export const creatorByHandle = (handle: string): Creator | undefined => BY_HANDLE.get(handle);

export function isLegacyLibraryCreatorHandle(handle: string): boolean {
  return (LEGACY_LIBRARY_CREATOR_HANDLES as readonly string[]).includes(handle);
}
