import { supabase } from "@/lib/supabase/client";

import {
  completeAuthCallback,
  stripAuthCallbackParams,
  type AuthCallbackResult,
} from "./consumeAuthCallback.ts";

/**
 * Browser adapter around the single PKCE/OTP owner. Pages must not call
 * `exchangeCodeForSession` themselves.
 */
export async function completeBrowserAuthCallback(href: string): Promise<AuthCallbackResult> {
  return completeAuthCallback(href, {
    exchangeCode: async (code) => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      return { session: data.session ?? null, errorMessage: error?.message ?? null };
    },
    verifyOtp: async ({ tokenHash, type }) => {
      const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      return { session: data.session ?? null, errorMessage: error?.message ?? null };
    },
    getSession: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session ?? null;
    },
    setSession: async ({ accessToken, refreshToken }) => {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      return { session: data.session ?? null, errorMessage: error?.message ?? null };
    },
  });
}

export function replaceAuthCallbackUrl(pathname: string) {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, document.title, stripAuthCallbackParams(window.location.href, pathname));
}
