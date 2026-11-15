/** Public Supabase connection settings (browser-safe anon/publishable key only). */
export class SupabaseConfigError extends Error {
  constructor(
    message: string,
    readonly missingKeys: string[] = [],
    readonly diagnostics?: SupabaseEnvDiagnostics,
  ) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

const REQUIRED_URL_KEY = "VITE_SUPABASE_URL";
const ANON_KEYS = ["VITE_SUPABASE_ANON_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;

/** Optional server-runtime aliases (same public values — never service-role). */
const SERVER_ALIASES: Record<string, string[]> = {
  VITE_SUPABASE_URL: ["SUPABASE_URL"],
  VITE_SUPABASE_ANON_KEY: ["SUPABASE_ANON_KEY", "SUPABASE_KEY"],
  VITE_SUPABASE_PUBLISHABLE_KEY: ["SUPABASE_PUBLISHABLE_KEY"],
  VITE_ADMIN_SITE_URL: ["ADMIN_SITE_URL"],
};

export type SupabaseEnvDiagnostics = {
  runtime: "server" | "browser";
  missingRequired: string[];
  presentKeys: string[];
  resolvedSources: Partial<Record<string, "import.meta.env" | "process.env" | "alias">>;
};

function nonEmpty(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isServerRuntime(): boolean {
  return typeof window === "undefined";
}

function readImportMeta(name: string): string | undefined {
  const meta = import.meta.env as Record<string, string | boolean | undefined>;
  return nonEmpty(typeof meta[name] === "string" ? meta[name] : undefined);
}

function readProcessEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  return nonEmpty(process.env[name]);
}

function resolveEnvKey(name: string): {
  value: string | undefined;
  source: SupabaseEnvDiagnostics["resolvedSources"][string];
} {
  if (isServerRuntime()) {
    const fromProcess = readProcessEnv(name);
    if (fromProcess) return { value: fromProcess, source: "process.env" };

    for (const alias of SERVER_ALIASES[name] ?? []) {
      const fromAlias = readProcessEnv(alias);
      if (fromAlias) return { value: fromAlias, source: "alias" };
    }
  }

  const fromMeta = readImportMeta(name);
  if (fromMeta) return { value: fromMeta, source: "import.meta.env" };

  if (isServerRuntime()) {
    const fromProcess = readProcessEnv(name);
    if (fromProcess) return { value: fromProcess, source: "process.env" };
  }

  return { value: undefined, source: undefined };
}

export function getSupabaseEnvDiagnostics(): SupabaseEnvDiagnostics {
  const keysToCheck = [
    REQUIRED_URL_KEY,
    ...ANON_KEYS,
    "VITE_ADMIN_SITE_URL",
    ...(isServerRuntime() ? (Object.values(SERVER_ALIASES).flat() as string[]) : []),
  ];

  const resolvedSources: SupabaseEnvDiagnostics["resolvedSources"] = {};
  const presentKeys: string[] = [];

  for (const key of keysToCheck) {
    const { value, source } = resolveEnvKey(key);
    if (value) {
      presentKeys.push(key);
      if (source) resolvedSources[key] = source;
    }
  }

  const missingRequired: string[] = [];
  if (!resolveEnvKey(REQUIRED_URL_KEY).value) {
    missingRequired.push(REQUIRED_URL_KEY);
  }
  const hasAnon = ANON_KEYS.some((key) => Boolean(resolveEnvKey(key).value));
  if (!hasAnon) {
    missingRequired.push("VITE_SUPABASE_ANON_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY");
  }

  return {
    runtime: isServerRuntime() ? "server" : "browser",
    missingRequired,
    presentKeys,
    resolvedSources,
  };
}

function formatConfigErrorMessage(diagnostics: SupabaseEnvDiagnostics): string {
  const missing = [...new Set(diagnostics.missingRequired)];
  return (
    `Missing required Supabase configuration (${diagnostics.runtime} runtime): ${missing.join(", ")}. ` +
    "Set these in Vercel for Production and Preview (available at build time for the browser bundle and at serverless runtime for SSR), then redeploy."
  );
}

export function getSupabasePublicConfig(): { url: string; anonKey: string } {
  const diagnostics = getSupabaseEnvDiagnostics();
  const url = resolveEnvKey(REQUIRED_URL_KEY).value;
  const anonKey =
    resolveEnvKey("VITE_SUPABASE_ANON_KEY").value ??
    resolveEnvKey("VITE_SUPABASE_PUBLISHABLE_KEY").value;

  if (!url || !anonKey) {
    throw new SupabaseConfigError(
      formatConfigErrorMessage(diagnostics),
      diagnostics.missingRequired,
      diagnostics,
    );
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
  return resolveEnvKey("VITE_ADMIN_SITE_URL").value;
}

/** Safe for logs — never includes secret values. */
export function formatSupabaseEnvDiagnosticsForLog(diagnostics: SupabaseEnvDiagnostics): string {
  return JSON.stringify({
    runtime: diagnostics.runtime,
    missingRequired: diagnostics.missingRequired,
    presentKeys: diagnostics.presentKeys,
    resolvedSources: diagnostics.resolvedSources,
  });
}
