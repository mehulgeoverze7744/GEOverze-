import type { LibraryResource } from "@/features/library/types";

/** Pre-publish validation for GEOlibrary resources. */
export function validateResourceForPublish(resource: LibraryResource): string[] {
  const errors: string[] = [];
  if (resource.title.trim().length < 4) errors.push("Title needs at least 4 characters.");
  if (!resource.slug.trim()) errors.push("Slug is required.");
  if (resource.description.trim().length < 10) errors.push("Description is too short.");
  if (resource.body.trim().length < 40) errors.push("Published resources need a longer body.");
  return errors;
}
