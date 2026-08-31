import { supabase } from "@/lib/supabase/client";

import { mapCreatorRowToCreator } from "./library-mapper";
import type { Creator } from "./creators";

export async function fetchPublishedCreators(): Promise<Creator[]> {
  const { data: rows, error } = await supabase
    .from("library_creators")
    .select("*")
    .order("joined_at", { ascending: false });

  if (error) throw new Error(`Failed to load creators: ${error.message}`);
  return (rows ?? []).map(mapCreatorRowToCreator);
}

export async function fetchCreatorByHandle(handle: string): Promise<Creator | null> {
  const { data: row, error } = await supabase
    .from("library_creators")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();

  if (error) throw new Error(`Failed to load creator "${handle}": ${error.message}`);
  return row ? mapCreatorRowToCreator(row) : null;
}
