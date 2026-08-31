import { supabase } from "@/lib/supabase/client";

import { mapCreatorPersonaRow } from "../creator-persona-mapper";
import type { LibraryCreatorPersona } from "../types";

export async function fetchLibraryCreatorPersonas(): Promise<LibraryCreatorPersona[]> {
  const { data: rows, error } = await supabase
    .from("library_creators")
    .select("*")
    .order("joined_at", { ascending: false });

  if (error) throw new Error(`Failed to load library creators: ${error.message}`);
  return (rows ?? []).map(mapCreatorPersonaRow);
}

export async function fetchLibraryCreatorPersonaByHandle(
  handle: string,
): Promise<LibraryCreatorPersona | null> {
  const { data: row, error } = await supabase
    .from("library_creators")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();

  if (error) throw new Error(`Creator "${handle}" could not be loaded: ${error.message}`);
  return row ? mapCreatorPersonaRow(row) : null;
}
