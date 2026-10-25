import { CREATORS, GVRZE_STUDIO_HANDLE, creatorByHandle, type Creator } from "./creators";

/**
 * Public creator catalogue. Library articles are official GVRZE content, so the
 * directory is the studio profile rather than placeholder rows stored for the
 * original seed.
 */
export async function fetchPublishedCreators(): Promise<Creator[]> {
  return [...CREATORS];
}

export async function fetchCreatorByHandle(handle: string): Promise<Creator | null> {
  if (handle !== GVRZE_STUDIO_HANDLE) return null;
  return creatorByHandle(handle) ?? null;
}
