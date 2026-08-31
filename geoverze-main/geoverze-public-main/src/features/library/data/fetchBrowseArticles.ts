import { supabase } from "@/lib/supabase/client";

import type { Article } from "./articles";
import { mapResourceRowToArticle } from "./library-mapper";
import type { LibraryQuery } from "../lib/filter";
import { readingTimeBucket } from "../data/taxonomy";

/** Server-side browse query over published resources. RLS enforces tier access. */
export async function fetchBrowseArticles(query: LibraryQuery): Promise<Article[]> {
  let request = supabase.from("library_resources").select("*").eq("status", "published");

  const q = query.q.trim();
  if (q.length > 0) {
    request = request.textSearch("search_vector", q, { type: "websearch", config: "english" });
  }

  if (query.continent !== "all") {
    request = request.eq("continent", query.continent);
  }
  if (query.difficulty !== "all") {
    request = request.eq("difficulty", query.difficulty);
  }
  if (query.category !== "all") {
    request = request.eq("subject_category", query.category);
  }

  switch (query.sort) {
    case "quickest":
      request = request.order("read_time_minutes", { ascending: true });
      break;
    case "newest":
    case "popular":
    case "bookmarked":
    default:
      request = request.order("published_at", { ascending: false, nullsFirst: false });
      break;
  }

  const { data: rows, error } = await request;
  if (error) throw new Error(`Failed to browse GEOlibrary: ${error.message}`);

  let articles = (rows ?? []).map((row) => mapResourceRowToArticle(row));

  if (query.time !== "all") {
    articles = articles.filter((a) => readingTimeBucket(a.minutes) === query.time);
  }

  return articles;
}
