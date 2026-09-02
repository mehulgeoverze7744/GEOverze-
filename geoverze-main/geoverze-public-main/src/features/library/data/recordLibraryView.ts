import { supabase } from "@/lib/supabase/client";

export type RecordLibraryViewResult = {
  counted: boolean;
  view_count: number;
};

/** Records an authenticated article view (6h server-side dedupe). */
export async function recordLibraryView(resourceId: string): Promise<RecordLibraryViewResult> {
  const { data, error } = await supabase.rpc("record_library_view", {
    _resource_id: resourceId,
  });

  if (error) {
    throw new Error(`Failed to record library view: ${error.message}`);
  }

  const payload = (data ?? {}) as Partial<RecordLibraryViewResult>;
  return {
    counted: Boolean(payload.counted),
    view_count: typeof payload.view_count === "number" ? payload.view_count : 0,
  };
}
