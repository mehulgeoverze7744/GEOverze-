import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MailCheck, MailQuestion } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { Spinner } from "@/components/shared/Spinner";
import {
  AuthGhostButton,
  AuthLayout,
  AuthSecondaryButton,
  AuthSubmitButton,
  SuccessBurst,
  SuccessMessage,
  ValidationMessage,
} from "@/features/auth/components";
import { AUTH_CALLBACK_PATH, mapAuthError } from "@/features/auth/lib/oauth";
import { readStoredVerifyEmail, rememberVerifyEmail } from "@/features/auth/lib/signupResult";
import { useMockRequest } from "@/features/auth/lib/useMockRequest";
import { supabase } from "@/lib/supabase/client";
import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

const RESEND_COOLDOWN = 30;

/**
 * Email verification.
 *
 * Confirming happens out-of-band (the user opens the emailed link, often in a
 * new tab). supabase-js syncs sessions across tabs of the same browser via
 * localStorage, so `useAuthStore`'s status flips to "signed-in" here
 * automatically the moment that happens — no polling required. The manual
 * "I've verified" button stays as an explicit fallback that re-checks the
 * session directly.
 */
export function VerifyEmailPage({ email }: { email?: string }) {
  const resend = useMockRequest({ delay: 900 });
  const confirm = useMockRequest({ delay: 600 });
  const [cooldown, setCooldown] = useState(0);
  const signedIn = useAuthStore(selectIsSignedIn);
  const destinationEmail = email?.trim() || readStoredVerifyEmail() || undefined;

  useEffect(() => {
    if (destinationEmail) rememberVerifyEmail(destinationEmail);
  }, [destinationEmail]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    if (params.get("code") || params.get("error") || hashParams.get("access_token") || hashParams.get("code")) {
      window.location.replace(`${AUTH_CALLBACK_PATH}${window.location.search}${window.location.hash}`);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onResend = async () => {
    if (!destinationEmail) return;
    const ok = await resend.run({
      action: async () => {
        const { error } = await supabase.auth.resend({ type: "signup", email: destinationEmail });
        if (error) return { ok: false, error: mapAuthError(error.message, error.code) };
        return { ok: true };
      },
    });
    if (ok) setCooldown(RESEND_COOLDOWN);
  };

  const onManualCheck = () =>
    void confirm.run({
      action: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) return { ok: false, error: error.message };
        if (!data.session) {
          return { ok: false, error: "Not verified yet — open the link from your inbox first." };
        }
        return { ok: true };
      },
    });

  if (signedIn || confirm.state === "success") {
    return (
      <PageShell className="pb-0">
        <AuthLayout eyebrow="Verified" title="Your email is confirmed">
          <SuccessBurst
            icon={<MailCheck className="h-7 w-7" strokeWidth={1.2} aria-hidden="true" />}
            title="Email verified"
            description="Next, set up your explorer profile."
          >
            <AuthSubmitButton asChild>
              <Link to="/auth/onboarding">Continue</Link>
            </AuthSubmitButton>
          </SuccessBurst>
        </AuthLayout>
      </PageShell>
    );
  }

  return (
    <PageShell className="pb-0">
      <AuthLayout
        eyebrow="One last step"
        title="Verify your email"
        description={
          destinationEmail
            ? `We sent a confirmation link to ${destinationEmail}. Open it on this device if you can, and check spam if it is not in your inbox.`
            : "We sent a confirmation link to your inbox. Open it to activate your account."
        }
        footer={
          <p>
            Wrong address?{" "}
            <Link
              to="/auth/signup"
              className="auth-link"
            >
              Start over
            </Link>
          </p>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-[16px] border border-[#E5E5EA] bg-[#F5F5F7] p-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E5E5EA] bg-white text-[#1D1D1F]">
              <MailQuestion className="h-5 w-5" strokeWidth={1.3} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[14px] font-medium text-[#1D1D1F]">
                Waiting for confirmation
                <Spinner size="sm" label="Waiting for email confirmation" />
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#86868B]">
                This page updates automatically once the link is opened.
              </p>
            </div>
          </div>

          {resend.state === "success" ? (
            <SuccessMessage>
              A new confirmation email is on its way. Check spam if it doesn't arrive shortly.
            </SuccessMessage>
          ) : null}
          {resend.state === "error" && resend.error ? (
            <ValidationMessage>{resend.error}</ValidationMessage>
          ) : null}
          {confirm.state === "error" && confirm.error ? (
            <ValidationMessage>{confirm.error}</ValidationMessage>
          ) : null}

          <div className="space-y-3">
            <AuthSubmitButton
              type="button"
              pending={confirm.state === "pending"}
              pendingLabel="Checking"
              onClick={onManualCheck}
            >
              I've verified my email
            </AuthSubmitButton>
            <AuthSecondaryButton
              disabled={!destinationEmail || resend.isPending || cooldown > 0}
              onClick={() => void onResend()}
            >
              {resend.isPending
                ? "Sending…"
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend email"}
            </AuthSecondaryButton>
            <AuthGhostButton asChild>
              <Link to="/auth/login" search={{ redirect: undefined }}>
                Return to sign in
              </Link>
            </AuthGhostButton>
          </div>
        </div>
      </AuthLayout>
    </PageShell>
  );
}
