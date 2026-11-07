import { resolveMapBoard } from "./mapBoards";

const wikiCache = new Map<string, string | null>();
const wikiInflight = new Map<string, Promise<string | null>>();

export function isDirectMediaUrl(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^(https?:\/\/|\/)/i.test(value);
}

export function wikiTitleFromArt(art: string): string | null {
  if (!art.toLowerCase().startsWith("wiki:")) return null;
  const title = art.slice(5).trim();
  return title.length > 0 ? title : null;
}

function wikiTitleCandidates(title: string): string[] {
  const trimmed = title.trim();
  const noParens = trimmed.replace(/\s*\([^)]*\)/g, "").trim();
  const slashParts = noParens.split(/\s*\/\s*/).map((part) => part.trim());
  return [...new Set([trimmed, noParens, ...slashParts].filter((part) => part.length > 2))];
}

async function fetchWikiSummaryImage(title: string): Promise<string | null> {
  const api = new URL("https://en.wikipedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("format", "json");
  api.searchParams.set("origin", "*");
  api.searchParams.set("prop", "pageimages");
  api.searchParams.set("piprop", "thumbnail");
  api.searchParams.set("pithumbsize", "960");
  api.searchParams.set("titles", title);
  const sized = await fetch(api.toString());
  if (sized.ok) {
    const payload = (await sized.json()) as {
      query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
    };
    const page = Object.values(payload.query?.pages ?? {})[0];
    if (page?.thumbnail?.source) return page.thumbnail.source;
  }

  const response = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    originalimage?: { source?: string };
    thumbnail?: { source?: string };
  };
  return data.thumbnail?.source ?? data.originalimage?.source ?? null;
}

async function fetchWikiImage(title: string): Promise<string | null> {
  const cached = wikiCache.get(title);
  if (cached !== undefined) return cached;
  const pending = wikiInflight.get(title);
  if (pending) return pending;

  const request = (async () => {
    try {
      for (const candidate of wikiTitleCandidates(title)) {
        const src = await fetchWikiSummaryImage(candidate);
        if (src) {
          wikiCache.set(title, src);
          return src;
        }
      }
      wikiCache.set(title, null);
      return null;
    } catch {
      wikiCache.set(title, null);
      return null;
    } finally {
      wikiInflight.delete(title);
    }
  })();

  wikiInflight.set(title, request);
  return request;
}

/** Resolve stored `art` to a browser URL, or null when a procedural fallback should be used. */
export async function resolveMediaSrc(art: string | undefined | null): Promise<string | null> {
  if (!art) return null;
  const mapped = resolveMapBoard({ boardArt: art, mediaArt: art });
  if (mapped && mapped.family) return mapped.src;
  if (isDirectMediaUrl(art)) return art;
  const wikiTitle = wikiTitleFromArt(art);
  if (wikiTitle) return fetchWikiImage(wikiTitle);
  return null;
}
