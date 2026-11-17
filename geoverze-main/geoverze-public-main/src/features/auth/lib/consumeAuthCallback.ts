/**
 * Single owner for PKCE / OTP / implicit callback consumption.
 *
 * supabase-js `detectSessionInUrl` is disabled so this module is the only
 * place that exchanges an authorization code. React StrictMode remounts and
 * the callback + reset-password routes share the same in-flight promise.
 */
import type { EmailOtpType, Session } from "@supabase/supabase-js";

import { mapAuthError, mapOAuthCallbackError } from "./oauth.ts";

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

export function asEmailOtpType(value: string | null | undefined): EmailOtpType | null {
  if (!value) return null;
  return EMAIL_OTP_TYPES.includes(value as EmailOtpType) ? (value as EmailOtpType) : null;
}

export type ParsedAuthCallback =
  | { kind: "oauth_error"; raw: string }
  | { kind: "pkce"; code: string; type: string | null }
  | { kind: "otp"; tokenHash: string; type: EmailOtpType }
  | { kind: "implicit"; accessToken: string; refreshToken: string; type: string | null }
  | { kind: "empty" };

export type AuthCallbackResult =
  | { status: "session"; session: Session; recovery: boolean }
  | { status: "error"; message: string; recovery: boolean }
  | { status: "empty"; recovery: boolean };

type AuthCallbackDeps = {
  exchangeCode: (code: string) => Promise<{ session: Session | null; errorMessage: string | null }>;
  verifyOtp: (input: {
    tokenHash: string;
    type: EmailOtpType;
  }) => Promise<{ session: Session | null; errorMessage: string | null }>;
  getSession: () => Promise<Session | null>;
  setSession?: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<{ session: Session | null; errorMessage: string | null }>;
};

const inflight = new Map<string, Promise<AuthCallbackResult>>();
const consumed = new Set<string>();

export function resetAuthCallbackConsumptionForTests() {
  inflight.clear();
  consumed.clear();
}

function firstParam(search: URLSearchParams, hash: URLSearchParams, key: string): string | null {
  return search.get(key) || hash.get(key);
}

function decodeParam(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

export function parseAuthCallbackLocation(href: string): ParsedAuthCallback {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { kind: "empty" };
  }
  const hash = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
  const oauthError = decodeParam(
    firstParam(url.searchParams, hash, "error_description") ?? firstParam(url.searchParams, hash, "error"),
  );
  if (oauthError) return { kind: "oauth_error", raw: oauthError };

  const code = firstParam(url.searchParams, hash, "code");
  if (code) {
    return { kind: "pkce", code, type: firstParam(url.searchParams, hash, "type") };
  }

  const tokenHash = firstParam(url.searchParams, hash, "token_hash");
  const otpType = asEmailOtpType(firstParam(url.searchParams, hash, "type"));
  if (tokenHash && otpType) {
    return { kind: "otp", tokenHash, type: otpType };
  }

  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (accessToken && refreshToken) {
    return {
      kind: "implicit",
      accessToken,
      refreshToken,
      type: hash.get("type") ?? url.searchParams.get("type"),
    };
  }

  return { kind: "empty" };
}

export function isRecoveryCallbackType(type: string | null | undefined): boolean {
  return type === "recovery";
}

export function classifyAuthCallbackFailure(message: string | null | undefined): string {
  const raw = (message ?? "").trim();
  const lower = raw.toLowerCase();
  if (!raw) return mapOAuthCallbackError("Google sign-in did not complete. Please try again.");
  if (
    lower.includes("already been used") ||
    lower.includes("code verifier") ||
    lower.includes("invalid flow state") ||
    lower.includes("flow_state not found") ||
    lower.includes("flow state")
  ) {
    return "This sign-in or confirmation link has already been used or has expired. Request a new email, or try signing in again.";
  }
  if (lower.includes("bad_code_verifier") || lower.includes("pkce")) {
    return "This sign-in could not be verified on this browser. Open the link on the same device and browser you started from, or try again.";
  }
  return mapOAuthCallbackError(raw);
}

function consumptionKey(parsed: ParsedAuthCallback): string | null {
  if (parsed.kind === "pkce") return `pkce:${parsed.code}`;
  if (parsed.kind === "otp") return `otp:${parsed.type}:${parsed.tokenHash}`;
  if (parsed.kind === "implicit") return `implicit:${parsed.accessToken.slice(0, 24)}`;
  return null;
}

async function existingSessionResult(
  getSession: AuthCallbackDeps["getSession"],
  recovery: boolean,
): Promise<AuthCallbackResult> {
  const session = await getSession();
  if (session?.user) return { status: "session", session, recovery };
  return { status: "empty", recovery };
}

export async function completeAuthCallback(
  href: string,
  deps: AuthCallbackDeps,
): Promise<AuthCallbackResult> {
  const parsed = parseAuthCallbackLocation(href);
  const recoveryHint =
    parsed.kind === "pkce" || parsed.kind === "otp" || parsed.kind === "implicit"
      ? isRecoveryCallbackType(parsed.type)
      : false;

  if (parsed.kind === "oauth_error") {
    return { status: "error", message: mapOAuthCallbackError(parsed.raw), recovery: recoveryHint };
  }

  const key = consumptionKey(parsed);
  if (!key) {
    return existingSessionResult(deps.getSession, recoveryHint);
  }

  if (consumed.has(key)) {
    const reused = await existingSessionResult(deps.getSession, recoveryHint);
    if (reused.status === "session") return reused;
    return {
      status: "error",
      message: classifyAuthCallbackFailure("This sign-in link has already been used."),
      recovery: recoveryHint,
    };
  }

  const running = inflight.get(key);
  if (running) return running;

  const work = (async (): Promise<AuthCallbackResult> => {
    try {
      if (parsed.kind === "pkce") {
        const { session, errorMessage } = await deps.exchangeCode(parsed.code);
        consumed.add(key);
        if (session?.user) {
          return {
            status: "session",
            session,
            recovery: recoveryHint || isRecoveryCallbackType(parsed.type),
          };
        }
        const fallback = await deps.getSession();
        if (fallback?.user) {
          return { status: "session", session: fallback, recovery: recoveryHint };
        }
        return {
          status: "error",
          message: classifyAuthCallbackFailure(errorMessage),
          recovery: recoveryHint,
        };
      }

      if (parsed.kind === "otp") {
        const { session, errorMessage } = await deps.verifyOtp({
          tokenHash: parsed.tokenHash,
          type: parsed.type,
        });
        consumed.add(key);
        if (session?.user) {
          return {
            status: "session",
            session,
            recovery: recoveryHint || parsed.type === "recovery",
          };
        }
        return {
          status: "error",
          message: mapAuthError(errorMessage),
          recovery: recoveryHint,
        };
      }

      if (parsed.kind === "implicit") {
        if (!deps.setSession) {
          consumed.add(key);
          return {
            status: "error",
            message: "This sign-in link is not supported in this browser. Request a new email.",
            recovery: recoveryHint,
          };
        }
        const { session, errorMessage } = await deps.setSession({
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
        });
        consumed.add(key);
        if (session?.user) {
          return { status: "session", session, recovery: recoveryHint };
        }
        return {
          status: "error",
          message: mapAuthError(errorMessage),
          recovery: recoveryHint,
        };
      }

      return { status: "empty", recovery: recoveryHint };
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, work);
  return work;
}

export function stripAuthCallbackParams(href: string, pathname: string): string {
  try {
    const url = new URL(href);
    url.search = "";
    url.hash = "";
    url.pathname = pathname;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return pathname;
  }
}
