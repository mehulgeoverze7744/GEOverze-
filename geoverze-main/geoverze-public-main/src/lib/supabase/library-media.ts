import { supabase } from "@/lib/supabase/client";

export const LIBRARY_MEDIA_BUCKET = "library-media";

const SIGNED_URL_TTL_SECONDS = 3600;
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export function isLibraryMediaPath(value: string): boolean {
  return /^(covers|articles|attachments|collections|creators)\/[^/]+/.test(value);
}

/** Resolve a private library-media object to a signed URL (cached). */
export async function resolveLibraryMediaUrl(path: string | null | undefined): Promise<string | null> {
  if (!path || !isLibraryMediaPath(path)) return null;

  const cached = signedUrlCache.get(path);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.url;
  }

  const { data, error } = await supabase.storage
    .from(LIBRARY_MEDIA_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("Failed to resolve library media URL", error);
    return null;
  }

  signedUrlCache.set(path, {
    url: data.signedUrl,
    expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
  });

  return data.signedUrl;
}

/** Procedural fallback key when `art` stores a storage path. */
export function proceduralArtKey(art: string): string {
  if (isLibraryMediaPath(art)) {
    const parts = art.split("/");
    return parts[parts.length - 1]?.replace(/\.[^.]+$/, "") ?? art;
  }
  return art;
}
