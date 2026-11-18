/**
 * Google Identity Services (GIS) → Supabase `signInWithIdToken`.
 *
 * Avoids Supabase-hosted OAuth redirects so Google shows the GVRZE origin
 * instead of *.supabase.co. Supabase remains the only session authority.
 */

import type { Session } from "@supabase/supabase-js";

import { mapAuthError, rememberAuthRedirect } from "./oauth.ts";
import type { GoogleCredentialResponse, GooglePromptMomentNotification } from "./googleGis.types.ts";

export const GOOGLE_GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";

const NONCE_BYTES = 32;

export function readGoogleClientId(): string {
  const raw =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined)
      : undefined;
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : "";
}

/** Cryptographically secure nonce (raw) — passed to Supabase after Google sign-in. */
export function generateGoogleAuthNonce(): string {
  const bytes = new Uint8Array(NONCE_BYTES);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/** SHA-256 hex digest of the raw nonce — passed to Google in `initialize`. */
export async function sha256HexNonce(rawNonce: string): Promise<string> {
  const encoded = new TextEncoder().encode(rawNonce);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function assertValidGoogleCredential(credential: string | null | undefined): string {
  const value = (credential ?? "").trim();
  if (!value) {
    throw new Error("Google sign-in did not return credentials. Please try again.");
  }
  // Do not decode the JWT — Supabase validates it server-side.
  if (value.split(".").length !== 3) {
    throw new Error("Google sign-in could not be completed. Try again, or use email and password.");
  }
  return value;
}

export function mapGoogleIdentityError(message: string | null | undefined, code?: string | null): string {
  const raw = (message ?? "").trim();
  const lower = raw.toLowerCase();
  const errorCode = (code ?? "").trim().toLowerCase();

  if (
    lower.includes("nonce") ||
    errorCode.includes("nonce") ||
    lower.includes("unauthorized client") ||
    lower.includes("invalid_grant")
  ) {
    return "Google sign-in could not be verified. Please try again, or use email and password.";
  }
  if (
    lower.includes("id token") ||
    lower.includes("invalid jwt") ||
    lower.includes("token has expired") ||
    errorCode === "invalid_credentials"
  ) {
    return "Google sign-in expired or was invalid. Please try again.";
  }
  if (lower.includes("popup") && lower.includes("blocked")) {
    return "Google sign-in was blocked by the browser. Allow popups for this site and try again.";
  }

  return mapAuthError(raw, code);
}

export function mapGooglePromptDismissal(notification: GooglePromptMomentNotification): string | null {
  if (notification.isDismissedMoment()) {
    const reason = notification.getDismissedReason();
    if (reason === "cancel_called" || reason === "credential_returned") return null;
    return "Google sign-in was cancelled. You can try again or use email and password.";
  }
  return null;
}

export type GoogleIdTokenExchangeDeps = {
  signInWithIdToken: (input: {
    provider: "google";
    token: string;
    nonce: string;
  }) => Promise<{ data: { session: Session | null }; error: { message: string; code?: string } | null }>;
};

export async function exchangeGoogleIdToken(
  credential: string,
  rawNonce: string,
  deps?: GoogleIdTokenExchangeDeps,
): Promise<Session> {
  if (googleSignInInFlight) {
    throw new Error("GOOGLE_SIGNIN_IN_FLIGHT");
  }
  googleSignInInFlight = true;
  const token = assertValidGoogleCredential(credential);
  if (!rawNonce.trim()) {
    googleSignInInFlight = false;
    throw new Error("Google sign-in could not be verified. Please try again.");
  }

  if (deps) {
    const { data, error } = await deps.signInWithIdToken({
      provider: "google",
      token,
      nonce: rawNonce,
    });
    try {
      if (error) {
        throw new Error(mapGoogleIdentityError(error.message, error.code));
      }
      if (!data.session) {
        throw new Error("Google sign-in did not complete. Please try again.");
      }
      return data.session;
    } finally {
      googleSignInInFlight = false;
    }
  }

  try {
    const { supabase } = await import("@/lib/supabase/client");
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token,
      nonce: rawNonce,
    });
    if (error) {
      throw new Error(mapGoogleIdentityError(error.message, error.code));
    }
    if (!data.session) {
      throw new Error("Google sign-in did not complete. Please try again.");
    }
    return data.session;
  } finally {
    googleSignInInFlight = false;
  }
}

let scriptLoadPromise: Promise<void> | null = null;

export function resetGoogleGisScriptStateForTests() {
  scriptLoadPromise = null;
}

export function isGoogleGisScriptAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.google?.accounts?.id);
}

/** Load GIS SDK once (`https://accounts.google.com/gsi/client`). */
export function loadGoogleGisScript(): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser."));
  }
  if (isGoogleGisScriptAvailable()) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[data-gvrze-gis="true"]`);
  if (existing) {
    scriptLoadPromise ??= new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Google sign-in.")), {
        once: true,
      });
    });
    return scriptLoadPromise;
  }

  scriptLoadPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GOOGLE_GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset["gvrzeGis"] = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google sign-in."));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

let googleSignInInFlight = false;

export function isGoogleSignInInFlight(): boolean {
  return googleSignInInFlight;
}

/** @deprecated use `isGoogleSignInInFlight` */
export function isGoogleOAuthInFlight(): boolean {
  return googleSignInInFlight;
}

export function resetGoogleSignInInFlightForTests() {
  googleSignInInFlight = false;
}

/** @deprecated use `resetGoogleSignInInFlightForTests` */
export function resetGoogleOAuthInFlightForTests() {
  resetGoogleSignInInFlightForTests();
}

export type InitializeGoogleIdentityButtonOptions = {
  parent: HTMLElement;
  clientId: string;
  onCredential: (response: GoogleCredentialResponse, rawNonce: string) => void | Promise<void>;
  onMoment?: (notification: GooglePromptMomentNotification, rawNonce: string) => void;
  width?: number;
};

/**
 * Initializes GIS and renders the official Sign-In button into `parent`.
 * A fresh nonce is created per initialization (call again for each attempt).
 */
export async function initializeGoogleIdentityButton(
  options: InitializeGoogleIdentityButtonOptions,
): Promise<{ rawNonce: string }> {
  const clientId = options.clientId.trim();
  if (!clientId) {
    throw new Error("Google sign-in is not configured yet. Use email and password, or try again later.");
  }

  await loadGoogleGisScript();
  const id = window.google?.accounts?.id;
  if (!id) {
    throw new Error("Could not load Google sign-in.");
  }

  const rawNonce = generateGoogleAuthNonce();
  const hashedNonce = await sha256HexNonce(rawNonce);

  options.parent.replaceChildren();

  id.initialize({
    client_id: clientId,
    nonce: hashedNonce,
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
    itp_support: true,
    callback: (response) => {
      void options.onCredential(response, rawNonce);
    },
  });

  id.renderButton(options.parent, {
    type: "standard",
    theme: "filled_black",
    size: "large",
    text: "continue_with",
    shape: "pill",
    logo_alignment: "left",
    width: options.width ?? Math.min(400, options.parent.clientWidth || 400),
  });

  return { rawNonce };
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
  }
}

export type GoogleIdentitySignInResult = {
  session: Session;
  userId: string;
};

/**
 * Programmatic GIS sign-in (One Tap prompt) after a user gesture.
 * Used when the branded button triggers `prompt()` instead of the rendered button.
 */
export async function startGoogleIdentitySignIn(next?: string | null): Promise<GoogleIdentitySignInResult> {
  if (typeof window === "undefined") {
    throw new Error("Google sign-in is only available in the browser.");
  }
  if (googleSignInInFlight) {
    throw new Error("GOOGLE_SIGNIN_IN_FLIGHT");
  }

  const clientId = readGoogleClientId();
  if (!clientId) {
    throw new Error("Google sign-in is not configured yet. Use email and password, or try again later.");
  }

  googleSignInInFlight = true;
  rememberAuthRedirect(next);

  try {
    await assertGoogleProviderEnabled();
    await loadGoogleGisScript();
    const id = window.google?.accounts?.id;
    if (!id) {
      throw new Error("Could not load Google sign-in.");
    }

    const rawNonce = generateGoogleAuthNonce();
    const hashedNonce = await sha256HexNonce(rawNonce);

    return await new Promise<GoogleIdentitySignInResult>((resolve, reject) => {
      let settled = false;

      const finish = (fn: () => void) => {
        if (settled) return;
        settled = true;
        googleSignInInFlight = false;
        fn();
      };

      id.initialize({
        client_id: clientId,
        nonce: hashedNonce,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
        callback: async (response) => {
          try {
            const session = await exchangeGoogleIdToken(response.credential ?? "", rawNonce);
            finish(() => resolve({ session, userId: session.user.id }));
          } catch (error) {
            finish(() =>
              reject(
                error instanceof Error
                  ? error
                  : new Error("Google sign-in could not be completed. Try again, or use email and password."),
              ),
            );
          }
        },
      });

      id.prompt((notification) => {
        const cancelled = mapGooglePromptDismissal(notification);
        if (cancelled) {
          finish(() => reject(new Error(cancelled)));
          return;
        }
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          finish(() =>
            reject(
              new Error(
                "Google sign-in is unavailable right now. Use the Sign in with Google button, or use email and password.",
              ),
            ),
          );
        }
      });
    });
  } catch (error) {
    googleSignInInFlight = false;
    throw error;
  }
}