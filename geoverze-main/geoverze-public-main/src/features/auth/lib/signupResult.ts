import { isDuplicateSignupUser, mapAuthError } from "./oauth.ts";

export const VERIFY_EMAIL_STORAGE_KEY = "gvrze.auth.verifyEmail";

export type SignupAuthError = {
  message?: string | null | undefined;
  code?: string | null | undefined;
  status?: number | null | undefined;
};

export type SignupAuthData = {
  user?: { identities?: Array<unknown> | null; email?: string | null } | null;
  session?: unknown | null;
};

export type SignupInterpretation =
  | { kind: "error"; message: string }
  | { kind: "signed_in" }
  | { kind: "needs_confirmation" }
  | { kind: "existing_account"; message: string };

export function rememberVerifyEmail(email: string) {
  if (typeof window === "undefined") return;
  const value = email.trim();
  if (!value) return;
  window.sessionStorage.setItem(VERIFY_EMAIL_STORAGE_KEY, value);
}

export function readStoredVerifyEmail(): string | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY)?.trim();
  return value || null;
}

export function logSignupFailure(error: SignupAuthError) {
  console.info("[auth] signup failed", {
    code: error.code ?? null,
    status: error.status ?? null,
    message: error.message ?? null,
  });
}

/**
 * Maps the supabase-js signUp() payload to the UI state machine.
 *
 * Confirm-email projects return a user and no session for a genuine new
 * address. Enumeration protection returns either an empty identities array
 * (confirmed duplicate) or a null user (existing address, confirmed or not).
 */
export function interpretSignupResult(
  data: SignupAuthData | null | undefined,
  error: SignupAuthError | null | undefined,
): SignupInterpretation {
  if (error) {
    return { kind: "error", message: mapAuthError(error.message, error.code) };
  }
  if (data?.session) return { kind: "signed_in" };
  if (isDuplicateSignupUser(data?.user)) {
    return {
      kind: "existing_account",
      message:
        "An account with this email already exists. Sign in, or confirm your email if you have not finished registration.",
    };
  }
  return { kind: "needs_confirmation" };
}
