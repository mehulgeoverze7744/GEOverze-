/** Public Supabase connection settings (browser-safe anon/publishable key only). */
export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

const CONFIG_MESSAGE =
  "Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY. " +
  "Set them in Vercel for Production and Preview (Build and Runtime), then redeploy.";

function nonEmpty(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Reads a VITE_* variable for both client and Nitro/Vercel SSR.
 *
 * - Browser bundles: values come from Vite `define` at build time (`import.meta.env`).
 * - Vercel serverless SSR: `import.meta.env` is a fixed build-time object that often omits
 *   `VITE_*` even when dashboard env vars exist at runtime — so we prefer `process.env` on SSR.
 */
function readPublicEnv(name: string): string | undefined {
  if (import.meta.env.SSR && typeof process !== "undefined" && process.env) {
    const fromRuntime = nonEmpty(process.env[name]);
    if (fromRuntime) return fromRuntime;
  }

  const meta = import.meta.env as Record<string, string | boolean | undefined>;
  const fromMeta = nonEmpty(typeof meta[name] === "string" ? meta[name] : undefined);
  if (fromMeta) return fromMeta;

  if (typeof process !== "undefined" && process.env) {
    return nonEmpty(process.env[name]);
  }

  return undefined;
}

export function getSupabasePublicConfig(): { url: string; anonKey: string } {
  const url = readPublicEnv("VITE_SUPABASE_URL");
  const anonKey =
    readPublicEnv("VITE_SUPABASE_ANON_KEY") ?? readPublicEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

  if (!url || !anonKey) {
    throw new SupabaseConfigError(CONFIG_MESSAGE);
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  try {
    getSupabasePublicConfig();
    return true;
  } catch {
    return false;
  }
}

export function getAdminSiteUrl(): string | undefined {
  return readPublicEnv("VITE_ADMIN_SITE_URL");
}