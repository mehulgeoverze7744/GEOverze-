import { supabase } from "@/lib/supabase/client";
import type { LibraryResource } from "@/features/library/types";

import { fetchLibraryResourceById } from "./fetchLibraryResources";
import { markdownToBlocks } from "./markdown-blocks";
import {
  resourceRecordToInsert,
  resourceRecordToUpdate,
  resolveAuthorHandle,
} from "./library-mapper";
import { validateResourceForPublish } from "./library-validation";

const FK_RESTRICT_CODE = "23503";

async function fetchCreators() {
  const { data, error } = await supabase.from("library_creators").select("*");
  if (error) throw new Error(`Failed to load creators: ${error.message}`);
  return data ?? [];
}

async function replaceBlocks(resourceId: string, body: string): Promise<void> {
  const blocks = markdownToBlocks(body);

  const { error: deleteError } = await supabase
    .from("library_resource_blocks")
    .delete()
    .eq("resource_id", resourceId);

  if (deleteError) {
    throw new Error(`Could not replace blocks: ${deleteError.message}`);
  }

  if (blocks.length === 0) return;

  const payload = blocks.map((block, position) => ({
    resource_id: resourceId,
    position,
    kind: block.kind,
    payload: block.payload,
  }));

  const { error: insertError } = await supabase.from("library_resource_blocks").insert(payload);
  if (insertError) throw new Error(`Could not save blocks: ${insertError.message}`);
}

function isFkRestrictError(error: { code?: string; message?: string }): boolean {
  return error.code === FK_RESTRICT_CODE || (error.message ?? "").includes("23503");
}

export async function createLibraryResource(resource: LibraryResource): Promise<LibraryResource> {
  if (!resource.title.trim()) throw new Error("A title is required.");

  const creators = await fetchCreators();
  const authorHandle = resolveAuthorHandle(resource.author, resource.authorHandle, creators);
  const payload = resourceRecordToInsert({ ...resource, authorHandle }, creators);

  const { data, error } = await supabase
    .from("library_resources")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(`Could not create resource: ${error.message}`);

  await replaceBlocks(data.id, resource.body);
  const detail = await fetchLibraryResourceById(data.id);
  return detail.resource;
}

export async function updateLibraryResource(resource: LibraryResource): Promise<void> {
  if (!resource.id) throw new Error("Resource ID is required for update.");
  if (!resource.title.trim()) throw new Error("A title is required.");

  const creators = await fetchCreators();
  const authorHandle = resolveAuthorHandle(resource.author, resource.authorHandle, creators);
  const payload = resourceRecordToUpdate({ ...resource, authorHandle }, creators);

  const { error } = await supabase
    .from("library_resources")
    .update(payload)
    .eq("id", resource.id);

  if (error) throw new Error(`Could not update resource: ${error.message}`);

  await replaceBlocks(resource.id, resource.body);
}

export async function publishLibraryResource(id: string): Promise<void> {
  const { resource } = await fetchLibraryResourceById(id);
  const errors = validateResourceForPublish(resource);
  if (errors.length > 0) throw new Error(errors.join(" "));

  const { error } = await supabase
    .from("library_resources")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`Could not publish resource: ${error.message}`);
}

export async function unpublishLibraryResource(id: string): Promise<void> {
  const { error } = await supabase
    .from("library_resources")
    .update({ status: "draft" })
    .eq("id", id);

  if (error) throw new Error(`Could not unpublish resource: ${error.message}`);
}

export async function submitLibraryResourceForReview(id: string): Promise<void> {
  const { error } = await supabase
    .from("library_resources")
    .update({ status: "pending" })
    .eq("id", id);

  if (error) throw new Error(`Could not submit resource for review: ${error.message}`);
}

export async function archiveLibraryResource(id: string): Promise<void> {
  const { error } = await supabase
    .from("library_resources")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) throw new Error(`Could not archive resource: ${error.message}`);
}

export async function deleteLibraryResource(id: string): Promise<void> {
  const { error } = await supabase.from("library_resources").delete().eq("id", id);

  if (error) {
    if (isFkRestrictError(error)) {
      throw new Error("This resource cannot be deleted because it is referenced elsewhere.");
    }
    throw new Error(`Could not delete resource: ${error.message}`);
  }
}

export async function duplicateLibraryResource(id: string): Promise<LibraryResource> {
  const { resource } = await fetchLibraryResourceById(id);
  const copy: LibraryResource = {
    ...resource,
    id: "",
    title: `${resource.title} (copy)`,
    slug: `${resource.slug}-copy`,
    status: "draft",
    featured: false,
    coverArtKey: null,
    views: 0,
    bookmarks: 0,
  };

  return createLibraryResource(copy);
}

export async function toggleLibraryFeatured(id: string, featured: boolean): Promise<void> {
  const { error } = await supabase
    .from("library_resources")
    .update({ featured })
    .eq("id", id);

  if (error) throw new Error(`Could not update featured state: ${error.message}`);
}
