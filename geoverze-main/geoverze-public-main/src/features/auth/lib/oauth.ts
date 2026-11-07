export const AUTH_CALLBACK_PATH = "/auth/callback";
export const AUTH_REDIRECT_STORAGE_KEY = "gvrze.auth.next";
export const DEFAULT_SIGNED_IN_PATH = "/profile";

const AUTH_PREFIX = "/auth";

/**
 * Only same-origin relative paths are accepted as post-login destinations.
 * Auth routes are rejected so a failed OAuth round-trip cannot loop.
 */
export function safeInternalPath(raw?: string | null): string | null {
  if (!raw) return null;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    // Keep the original string when it is not URI-encoded.
  }
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  if (value.includes("\\")) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return null;
  const pathOnly = value.split("#")[0] ?? "";
  if (!pathOnly.startsWith("/")) return null;
  const pathname = pathOnly.split("?")[0] ?? pathOnly;
  if (pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)) return null;
  return pathOnly;
}

export function rememberAuthRedirect(path?: string | null) {
  if (typeof window === "undefined") return;
  const safe = safeInternalPath(path);
  if (!safe) {
    window.sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, safe);
}

export function consumeStoredAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const stored = window.sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
  return safeInternalPath(stored);
}

/** Supabase anti-enumeration: confirmed-email duplicates return a user with no identities. */
export function isDuplicateSignupUser(
  user: { identities?: Array<unknown> | null } | null | undefined,
): boolean {
  return Boolean(user && Array.isArray(user.identities) && user.identities.length === 0);
}

export function mapAuthError(message: string | null | undefined): string {
  const raw = (message ?? "").trim();
  const lower = raw.toLowerCase();

  if (!raw) return "Something went wrong. Please try again.";

  if (
    lower.includes("already registered") ||
    lower.includes("already exists") ||
    lower.includes("user already") ||
    lower.includes("email address is already")
  ) {
    return "An account with this email already exists. Sign in or continue with Google.";
  }
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email or password is incorrect.";
  }
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Please confirm your email before signing in. Check your inbox for the verification link.";
  }
  if (
    (lower.includes("password") &&
      (lower.includes("weak") ||
        lower.includes("least") ||
        lower.includes("characters") ||
        lower.includes("pwned"))) ||
    lower.includes("password should be")
  ) {
    return "Choose a stronger password: at least 8 characters with upper, lower, number, and a special character.";
  }
  if (lower.includes("rate limit") || lower.includes("too many") || lower.includes("over_request")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (
    lower.includes("provider is not enabled") ||
    lower.includes("unsupported provider") ||
    (lower.includes("validation_failed") && lower.includes("provider"))
  ) {
    return "Google sign-in is not enabled on the authentication service yet. Use email and password, or try again later.";
  }
  if (lower.includes("redirect") && (lower.includes("not allowed") || lower.includes("whitelist") || lower.includes("allow"))) {
    return "Google sign-in could not return to this site. The callback URL needs to be added in the authentication settings.";
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("load failed") ||
    lower.includes("networkerror")
  ) {
    return "Could not reach the authentication service. Check your connection and try again.";
  }
  if (lower.includes("invalid api key") || lower.includes("invalid jwt")) {
    return "Authentication is misconfigured. Please try again later.";
  }
  if (lower.includes("signup is disabled") || lower.includes("signups not allowed")) {
    return "New account registration is temporarily closed. Please try again later.";
  }
  if (lower.includes("unable to validate email") || lower.includes("invalid email")) {
    return "Enter a valid email address.";
  }

  return raw;
}

export function mapOAuthCallbackError(error: string | null | undefined): string {
  const raw = (error ?? "").trim();
  const lower = raw.toLowerCase();
  if (!raw) return "Google sign-in did not complete. Please try again.";
  if (lower.includes("access_denied") || lower.includes("user cancelled") || lower.includes("denied")) {
    return "Google sign-in was cancelled. You can try again or use email and password.";
  }
  if (lower.includes("otp_expired") || lower.includes("flow_state") || lower.includes("expired")) {
    return "This sign-in link expired. Please start Google sign-in again.";
  }
  return mapAuthError(raw);
}

export function oauthCallbackUrl(): string {
  if (typeof window === "undefined") return AUTH_CALLBACK_PATH;
  return `${window.location.origin}${AUTH_CALLBACK_PATH}`;
}

async function assertGoogleProviderEnabled() {
  const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  if (!supabaseUrl || !anonKey) {
    throw new Error("Authentication is misconfigured. Please try again later.");
  }
  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    if (!response.ok) return;
    const settings = (await response.json()) as { external?: { google?: boolean } };
    if (settings.external?.google !== true) {
      throw new Error(
        "Google sign-in is not enabled on the authentication service yet. Use email and password, or try again later.",
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Google sign-in is not enabled")) {
      throw error;
    }
    // If settings cannot be read, continue and let the OAuth call surface the real error.
  }
}

export async function startGoogleOAuth(next?: string | null) {
  if (typeof window === "undefined") {
    throw new Error("Google sign-in is only available in the browser.");
  }
  rememberAuthRedirect(next);
  await assertGoogleProviderEnabled();
  const { supabase } = await import("@/lib/supabase/client");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: oauthCallbackUrl(),
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });
  if (error) {
    throw new Error(mapAuthError(error.message));
  }
}

type PostAuthProfile = {
  age_bracket?: string | null;
  avatar_id?: string | null;
};

/**
 * First-time users (unset age / no onboarding) continue the existing journey.
 * Returning users go to the requested page or the profile dashboard.
 */
export async function resolvePostAuthDestination(
  userId: string,
  requested?: string | null,
): Promise<string> {
  const fallback = safeInternalPath(requested) ?? DEFAULT_SIGNED_IN_PATH;
  try {
    const { supabase } = await import("@/lib/supabase/client");
    // age_bracket / profile_preferences exist in the live schema but are not
    // yet in the generated Database types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("age_bracket, avatar_id")
      .eq("id", userId)
      .maybeSingle();

    const typed = profile as PostAuthProfile | null;
    const age = typed?.age_bracket;
    if (!age || age === "unset") return "/auth/age-verification";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prefs } = await (supabase as any)
      .from("profile_preferences")
      .select("skill_level")
      .eq("user_id", userId)
      .maybeSingle();

    const hasOnboarded = Boolean(
      typed?.avatar_id || (prefs as { skill_level?: string | null } | null)?.skill_level,
    );
    if (!hasOnboarded) return "/auth/onboarding";
    return fallback;
  } catch {
    return fallback;
  }
}
