import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

import type { LibraryCreatorPersona } from "./types";

type CreatorRow = Tables<"library_creators">;

export function mapCreatorPersonaRow(row: CreatorRow): LibraryCreatorPersona {
  return {
    handle: row.handle,
    displayName: row.display_name,
    role: row.role,
    bio: row.bio,
    artKey: row.art_key,
    verified: row.verified,
    location: row.location ?? "",
    joinedAt: row.joined_at,
    featuredCollectionSlug: row.featured_collection_slug,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function creatorPersonaToInsert(
  persona: LibraryCreatorPersona,
): TablesInsert<"library_creators"> {
  return {
    handle: persona.handle.trim(),
    display_name: persona.displayName.trim(),
    role: persona.role.trim(),
    bio: persona.bio.trim(),
    art_key: persona.artKey.trim() || `creator-${persona.handle}`,
    verified: persona.verified,
    location: persona.location.trim() || null,
    joined_at: persona.joinedAt,
    featured_collection_slug: persona.featuredCollectionSlug,
    user_id: persona.userId,
  };
}

export function creatorPersonaToUpdate(
  persona: LibraryCreatorPersona,
): TablesUpdate<"library_creators"> {
  return {
    display_name: persona.displayName.trim(),
    role: persona.role.trim(),
    bio: persona.bio.trim(),
    art_key: persona.artKey.trim() || `creator-${persona.handle}`,
    verified: persona.verified,
    location: persona.location.trim() || null,
    joined_at: persona.joinedAt,
    featured_collection_slug: persona.featuredCollectionSlug,
  };
}
