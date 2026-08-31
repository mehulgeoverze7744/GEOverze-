import { supabase } from "@/lib/supabase/client";

export const LIBRARY_MEDIA_BUCKET = "library-media";

export const LIBRARY_MEDIA_MAX_BYTES = 10 * 1024 * 1024;

export const LIBRARY_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type LibraryMediaMime = (typeof LIBRARY_MEDIA_MIME_TYPES)[number];

const MIME_TO_EXT: Record<LibraryMediaMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function isLibraryMediaPath(value: string): boolean {
  return /^(covers|articles|attachments|collections|creators)\/[^/]+/.test(value);
}

export function sanitizeLibrarySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function extensionForMime(mime: string): string {
  const ext = MIME_TO_EXT[mime as LibraryMediaMime];
  if (!ext) throw new Error("Unsupported file type.");
  return ext;
}

export function validateLibraryMediaFile(file: File): void {
  if (!LIBRARY_MEDIA_MIME_TYPES.includes(file.type as LibraryMediaMime)) {
    throw new Error("Only JPEG, PNG, WebP and PDF files are allowed.");
  }
  if (file.size > LIBRARY_MEDIA_MAX_BYTES) {
    throw new Error("File exceeds the 10 MB limit.");
  }
}

export function coverObjectPath(resourceSlug: string, mime: string): string {
  const slug = sanitizeLibrarySlug(resourceSlug);
  if (!slug) throw new Error("Resource slug is required before uploading a cover.");
  return `covers/${slug}/cover.${extensionForMime(mime)}`;
}

export function galleryObjectPath(resourceSlug: string, figureId: string, mime: string): string {
  const slug = sanitizeLibrarySlug(resourceSlug);
  if (!slug) throw new Error("Resource slug is required before uploading gallery media.");
  return `articles/${slug}/gallery/${figureId}.${extensionForMime(mime)}`;
}

export function attachmentObjectPath(
  resourceSlug: string,
  attachmentId: string,
  mime: string,
): string {
  const slug = sanitizeLibrarySlug(resourceSlug);
  if (!slug) throw new Error("Resource slug is required before uploading attachments.");
  return `attachments/${slug}/${attachmentId}.${extensionForMime(mime)}`;
}

export function collectionCoverObjectPath(collectionSlug: string, mime: string): string {
  const slug = sanitizeLibrarySlug(collectionSlug);
  if (!slug) throw new Error("Collection slug is required before uploading cover art.");
  return `collections/${slug}/cover.${extensionForMime(mime)}`;
}

export function creatorAssetObjectPath(handle: string, assetId: string, mime: string): string {
  const slug = sanitizeLibrarySlug(handle);
  if (!slug) throw new Error("Creator handle is required before uploading assets.");
  return `creators/${slug}/${assetId}.${extensionForMime(mime)}`;
}

export async function uploadLibraryMediaObject(
  path: string,
  file: File,
): Promise<string> {
  validateLibraryMediaFile(file);

  const { error } = await supabase.storage.from(LIBRARY_MEDIA_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

export async function removeLibraryMediaObject(path: string): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from(LIBRARY_MEDIA_BUCKET).remove([path]);
  if (error) throw new Error(`Could not remove media object: ${error.message}`);
}

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export async function createLibraryMediaSignedUrl(
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  if (!path) return null;

  const cached = signedUrlCache.get(path);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.url;
  }

  const { data, error } = await supabase.storage
    .from(LIBRARY_MEDIA_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error("Failed to create signed URL", error);
    return null;
  }

  signedUrlCache.set(path, {
    url: data.signedUrl,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  });

  return data.signedUrl;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function attachmentKindForMime(mime: string): "PDF" | "Image" {
  return mime === "application/pdf" ? "PDF" : "Image";
}
