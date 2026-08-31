import { supabase } from "@/lib/supabase/client";

import { creatorPersonaToInsert, creatorPersonaToUpdate } from "../creator-persona-mapper";
import { fetchLibraryCreatorPersonaByHandle } from "./fetchLibraryCreatorPersonas";
import type { LibraryCreatorPersona } from "../types";

export async function createLibraryCreatorPersona(
  persona: LibraryCreatorPersona,
): Promise<LibraryCreatorPersona> {
  if (!persona.handle.trim()) throw new Error("Handle is required.");
  if (!persona.displayName.trim()) throw new Error("Display name is required.");

  const { error } = await supabase.from("library_creators").insert(creatorPersonaToInsert(persona));
  if (error) throw new Error(`Could not create creator: ${error.message}`);

  const created = await fetchLibraryCreatorPersonaByHandle(persona.handle);
  if (!created) throw new Error("Creator was created but could not be loaded.");
  return created;
}

export async function updateLibraryCreatorPersona(persona: LibraryCreatorPersona): Promise<void> {
  if (!persona.handle.trim()) throw new Error("Handle is required.");

  const { error } = await supabase
    .from("library_creators")
    .update(creatorPersonaToUpdate(persona))
    .eq("handle", persona.handle);

  if (error) throw new Error(`Could not update creator: ${error.message}`);
}

export async function deleteLibraryCreatorPersona(handle: string): Promise<void> {
  const { error } = await supabase.from("library_creators").delete().eq("handle", handle);
  if (error) throw new Error(`Could not delete creator: ${error.message}`);
}

export function createDraftCreatorPersona(): LibraryCreatorPersona {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  return {
    handle: "",
    displayName: "",
    role: "",
    bio: "",
    artKey: "",
    verified: false,
    location: "",
    joinedAt: today,
    featuredCollectionSlug: null,
    userId: null,
    createdAt: now,
    updatedAt: now,
  };
}
