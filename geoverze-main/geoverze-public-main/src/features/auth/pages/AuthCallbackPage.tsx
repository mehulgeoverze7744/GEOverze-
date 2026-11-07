import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { GeoButton } from "@/components/shared/GeoButton";
import { Spinner } from "@/components/shared/Spinner";
import { AuthLayout, ValidationMessage } from "@/features/auth/components";
import {
  consumeStoredAuthRedirect,
  mapOAuthCallbackError,
  resolvePostAuthDestination,
  safeInternalPath,
} from "@/features/auth/lib/oauth";
import { supabase } from "@/lib/supabase/client";

/**
 * PKCE landing page for Google OAuth and email-confirmation links.
 * Exchanges `?code=` for a session, then continues the existing auth journey.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const url = new URL(window.location.href);
      const oauthError =
        url.searchParams.get("error_description") ??
        url.searchParams.get("error") ??
        url.hash.match(/error_description=([^&]+)/)?.[1] ??
        url.hash.match(/error=([^&]+)/)?.[1];
      const code = url.searchParams.get("code");
      const requestedNext =
        consumeStoredAuthRedirect() ?? safeInternalPath(url.searchParams.get("next"));

      if (oauthError) {
        if (!cancelled) setError(mapOAuthCallbackError(decodeURIComponent(oauthError.replace(/\+/g, " "))));
        return;
      }

      let session = (await supabase.auth.getSession()).data.session;

      if (!session && code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          session = (await supabase.auth.getSession()).data.session;
          if (!session) {
            if (!cancelled) setError(mapOAuthCallbackError(exchangeError.message));
            return;
          }
        } else {
          session = data.session;
        }
      }

      if (!session?.user) {
        if (!cancelled) {
          setError("Sign-in did not complete. Please try again.");
        }
        return;
      }

      if (url.searchParams.get("type") === "recovery") {
        window.history.replaceState({}, document.title, "/auth/reset-password");
        await navigate({ to: "/auth/reset-password", replace: true });
        return;
      }

      const destination = await resolvePostAuthDestination(session.user.id, requestedNext);
      if (cancelled) return;
      window.history.replaceState({}, document.title, "/auth/callback");
      await navigate({ to: destination as never, replace: true });
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <PageShell>
        <AuthLayout
          eyebrow="Sign in"
          title="Could not complete sign-in"
          description="You can try Google again or use your email and password."
        >
          <div className="space-y-5">
            <ValidationMessage>{error}</ValidationMessage>
            <div className="flex flex-col gap-3 sm:flex-row">
              <GeoButton asChild variant="primary" className="flex-1">
                <Link to="/auth/login">Return to sign in</Link>
              </GeoButton>
              <GeoButton asChild variant="secondary" className="flex-1">
                <Link to="/auth/signup">Create account</Link>
              </GeoButton>
            </div>
          </div>
        </AuthLayout>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AuthLayout eyebrow="Signing you in" title="Finishing authentication" description="One moment while we restore your session.">
        <div className="flex items-center gap-3 text-sm text-foreground/60">
          <Spinner label="Completing sign-in" />
          <span>Connecting your GVRZE account…</span>
        </div>
      </AuthLayout>
    </PageShell>
  );
}
