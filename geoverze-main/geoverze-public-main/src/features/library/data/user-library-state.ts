import { supabase } from "@/lib/supabase/client";

export type ServerLibraryState = {
  bookmarks: Map<string, string>;
  likes: Map<string, string>;
  progress: Map<string, { percent: number; completed: boolean }>;
};

/** Slug → resource id for known slugs. */
export async function fetchResourceIdsBySlugs(
  slugs: readonly string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const { data, error } = await supabase
    .from("library_resources")
    .select("id, slug")
    .in("slug", unique);

  if (error) throw new Error(`Failed to resolve library slugs: ${error.message}`);

  return new Map((data ?? []).map((row) => [row.slug, row.id]));
}

/** Fetch authenticated user's library state keyed by slug. */
export async function fetchServerLibraryState(userId: string): Promise<ServerLibraryState> {
  const [bookmarksRes, likesRes, progressRes] = await Promise.all([
    supabase
      .from("user_library_bookmarks")
      .select("resource_id, library_resources(slug)")
      .eq("user_id", userId),
    supabase
      .from("user_library_likes")
      .select("resource_id, library_resources(slug)")
      .eq("user_id", userId),
    supabase
      .from("user_library_progress")
      .select("resource_id, progress_percent, completed_at, library_resources(slug)")
      .eq("user_id", userId),
  ]);

  if (bookmarksRes.error) {
    throw new Error(`Failed to load bookmarks: ${bookmarksRes.error.message}`);
  }
  if (likesRes.error) throw new Error(`Failed to load likes: ${likesRes.error.message}`);
  if (progressRes.error) {
    throw new Error(`Failed to load progress: ${progressRes.error.message}`);
  }

  const bookmarks = new Map<string, string>();
  for (const row of bookmarksRes.data ?? []) {
    const slug = row.library_resources?.slug;
    if (slug) bookmarks.set(slug, row.resource_id);
  }

  const likes = new Map<string, string>();
  for (const row of likesRes.data ?? []) {
    const slug = row.library_resources?.slug;
    if (slug) likes.set(slug, row.resource_id);
  }

  const progress = new Map<string, { percent: number; completed: boolean }>();
  for (const row of progressRes.data ?? []) {
    const slug = row.library_resources?.slug;
    if (!slug) continue;
    progress.set(slug, {
      percent: row.progress_percent,
      completed: row.completed_at != null || row.progress_percent >= 100,
    });
  }

  return { bookmarks, likes, progress };
}

export async function insertBookmark(userId: string, resourceId: string) {
  const { error } = await supabase
    .from("user_library_bookmarks")
    .upsert(
      { user_id: userId, resource_id: resourceId },
      { onConflict: "user_id,resource_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(`Failed to save bookmark: ${error.message}`);
}

export async function deleteBookmark(userId: string, resourceId: string) {
  const { error } = await supabase
    .from("user_library_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("resource_id", resourceId);
  if (error) throw new Error(`Failed to remove bookmark: ${error.message}`);
}

export async function insertLike(userId: string, resourceId: string) {
  const { error } = await supabase
    .from("user_library_likes")
    .upsert(
      { user_id: userId, resource_id: resourceId },
      { onConflict: "user_id,resource_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(`Failed to save like: ${error.message}`);
}

export async function deleteLike(userId: string, resourceId: string) {
  const { error } = await supabase
    .from("user_library_likes")
    .delete()
    .eq("user_id", userId)
    .eq("resource_id", resourceId);
  if (error) throw new Error(`Failed to remove like: ${error.message}`);
}

/** Monotonic server-side progress upsert (GL-7 RPC). */
export async function upsertProgress(
  resourceId: string,
  progressPercent: number,
  completed = false,
) {
  const { error } = await supabase.rpc("upsert_library_progress", {
    _resource_id: resourceId,
    _progress_percent: progressPercent,
    _completed: completed,
  });
  if (error) throw new Error(`Failed to save progress: ${error.message}`);
}
