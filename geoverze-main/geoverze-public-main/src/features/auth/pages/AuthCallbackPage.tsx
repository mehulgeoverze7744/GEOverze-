import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { Spinner } from "@/components/shared/Spinner";
import {
  AuthLayout,
  AuthSecondaryButton,
  AuthSubmitButton,
  ValidationMessage,
} from "@/features/auth/components";
import { completeBrowserAuthCallback, replaceAuthCallbackUrl } from "@/features/auth/lib/completeBrowserAuthCallback";
import {
  consumeStoredAuthRedirect,
  resolvePostAuthDestination,
  safeInternalPath,
} from "@/features/auth/lib/oauth";

/**
 * PKCE landing page for email confirmation, magic links, and legacy auth codes.
 * Google sign-in uses Google Identity Services + signInWithIdToken (no redirect here).
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const url = new URL(window.location.href);
      const requestedNext =
        consumeStoredAuthRedirect() ?? safeInternalPath(url.searchParams.get("next"));
      const result = await completeBrowserAuthCallback(window.location.href);

      if (cancelled) return;

      if (result.status === "error") {
        replaceAuthCallbackUrl("/auth/callback");
        setError(result.message);
        return;
      }

      if (result.status === "empty" || !result.session?.user) {
        replaceAuthCallbackUrl("/auth/callback");
        setError("Sign-in did not complete. Please try again.");
        return;
      }

      if (result.recovery) {
        replaceAuthCallbackUrl("/auth/reset-password");
        await navigate({ to: "/auth/reset-password", replace: true });
        return;
      }

      const destination = await resolvePostAuthDestination(result.session.user.id, requestedNext);
      if (cancelled) return;
      replaceAuthCallbackUrl("/auth/callback");
      await navigate({ to: destination as never, replace: true });
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <PageShell className="pb-0">
        <AuthLayout
          eyebrow="Sign in"
          title="Could not complete sign-in"
          description="Try signing in again, request a new confirmation email, or create an account."
        >
          <div className="space-y-5">
            <ValidationMessage>{error}</ValidationMessage>
            <div className="flex flex-col gap-3">
              <AuthSubmitButton asChild>
                <Link to="/auth/login" search={{ redirect: undefined }}>
                  Return to sign in
                </Link>
              </AuthSubmitButton>
              <AuthSecondaryButton asChild>
                <Link to="/auth/signup">Create account</Link>
              </AuthSecondaryButton>
            </div>
          </div>
        </AuthLayout>
      </PageShell>
    );
  }

  return (
    <PageShell className="pb-0">
      <AuthLayout eyebrow="Signing you in" title="Finishing authentication" description="One moment while we restore your session.">
        <div className="flex items-center gap-3 text-[14px] text-[#86868B]">
          <Spinner label="Completing sign-in" />
          <span>Connecting your GVRZE account…</span>
        </div>
      </AuthLayout>
    </PageShell>
  );
}
