import { supabase } from "@/lib/supabase/client";

import { collectionToInsert, collectionToUpdate, mapCollectionRow } from "../collection-mapper";
import { fetchLibraryCollectionById } from "./fetchLibraryCollections";
import type { LibraryCollection } from "../types";

export async function createLibraryCollection(
  collection: LibraryCollection,
): Promise<LibraryCollection> {
  if (!collection.title.trim()) throw new Error("A title is required.");
  if (!collection.slug.trim()) throw new Error("A slug is required.");

  const { data, error } = await supabase
    .from("library_collections")
    .insert(collectionToInsert(collection))
    .select("*")
    .single();

  if (error) throw new Error(`Could not create collection: ${error.message}`);

  if (collection.memberResourceIds.length > 0) {
    await replaceCollectionItems(data.id, collection.memberResourceIds);
  }

  return fetchLibraryCollectionById(data.id);
}

export async function updateLibraryCollection(collection: LibraryCollection): Promise<void> {
  if (!collection.id) throw new Error("Collection ID is required.");
  if (!collection.title.trim()) throw new Error("A title is required.");

  const { error } = await supabase
    .from("library_collections")
    .update(collectionToUpdate(collection))
    .eq("id", collection.id);

  if (error) throw new Error(`Could not update collection: ${error.message}`);

  await replaceCollectionItems(collection.id, collection.memberResourceIds);
}

/** Replace all membership rows with normalized positions (0..n-1). */
export async function replaceCollectionItems(
  collectionId: string,
  resourceIds: readonly string[],
): Promise<void> {
  const unique = [...new Set(resourceIds.filter(Boolean))];

  const { error: deleteError } = await supabase
    .from("library_collection_items")
    .delete()
    .eq("collection_id", collectionId);

  if (deleteError) {
    throw new Error(`Could not clear collection membership: ${deleteError.message}`);
  }

  if (unique.length === 0) return;

  const payload = unique.map((resource_id, position) => ({
    collection_id: collectionId,
    resource_id,
    position,
  }));

  const { error: insertError } = await supabase.from("library_collection_items").insert(payload);
  if (insertError) throw new Error(`Could not save collection membership: ${insertError.message}`);
}

export async function publishLibraryCollection(id: string): Promise<void> {
  const { error } = await supabase
    .from("library_collections")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`Could not publish collection: ${error.message}`);
}

export async function unpublishLibraryCollection(id: string): Promise<void> {
  const { error } = await supabase
    .from("library_collections")
    .update({ status: "draft" })
    .eq("id", id);

  if (error) throw new Error(`Could not unpublish collection: ${error.message}`);
}

export async function submitLibraryCollectionForReview(id: string): Promise<void> {
  const { error } = await supabase
    .from("library_collections")
    .update({ status: "pending" })
    .eq("id", id);

  if (error) throw new Error(`Could not submit collection for review: ${error.message}`);
}

export async function archiveLibraryCollection(id: string): Promise<void> {
  const { error } = await supabase
    .from("library_collections")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) throw new Error(`Could not archive collection: ${error.message}`);
}

export async function deleteLibraryCollection(id: string): Promise<void> {
  const { error } = await supabase.from("library_collections").delete().eq("id", id);
  if (error) throw new Error(`Could not delete collection: ${error.message}`);
}

export async function toggleCollectionFeatured(id: string, featured: boolean): Promise<void> {
  const { error } = await supabase.from("library_collections").update({ featured }).eq("id", id);
  if (error) throw new Error(`Could not update featured state: ${error.message}`);
}

export function createDraftCollection(curatorHandle: string): LibraryCollection {
  const now = new Date().toISOString();
  return {
    id: "",
    slug: "",
    title: "",
    description: "",
    artKey: "",
    subjectCategory: "basics",
    continent: "global",
    curatorHandle,
    featured: false,
    status: "draft",
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
    memberResourceIds: [],
  };
}
