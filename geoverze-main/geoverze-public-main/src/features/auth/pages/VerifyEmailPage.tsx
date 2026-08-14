import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MailCheck, MailQuestion } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { GeoButton } from "@/components/shared/GeoButton";
import { Spinner } from "@/components/shared/Spinner";
import {
  AuthLayout,
  AuthSubmitButton,
  SuccessBurst,
  SuccessMessage,
} from "@/features/auth/components";
import { useMockRequest } from "@/features/auth/lib/useMockRequest";

const RESEND_COOLDOWN = 30;

/**
 * Email verification. Pending by default; "I've verified" moves the journey on
 * to the mandatory age check.
 */
export function VerifyEmailPage({ email }: { email?: string }) {
  const resend = useMockRequest({ delay: 900 });
  const confirm = useMockRequest({ delay: 1200 });
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onResend = async () => {
    const ok = await resend.run();
    if (ok) setCooldown(RESEND_COOLDOWN);
  };

  if (confirm.state === "success") {
    return (
      <PageShell>
        <AuthLayout eyebrow="Verified" title="Your email is confirmed">
          <SuccessBurst
            icon={<MailCheck className="h-7 w-7" strokeWidth={1.2} aria-hidden="true" />}
            title="Email verified"
            description="One quick eligibility question and you're into GEOverze."
          >
            <GeoButton asChild variant="primary" className="w-full sm:w-auto">
              <Link to="/auth/age-verification">Continue</Link>
            </GeoButton>
          </SuccessBurst>
        </AuthLayout>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AuthLayout
        eyebrow="One last step"
        title="Verify your email"
        description={
          email
            ? `We sent a confirmation link to ${email}. Open it to activate your account.`
            : "We sent a confirmation link to your inbox. Open it to activate your account."
        }
        footer={
          <p>
            Wrong address?{" "}
            <Link
              to="/auth/signup"
              className="text-bronze transition-colors hover:text-bronze-glow"
            >
              Start over
            </Link>
          </p>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-2xl border border-bronze/15 bg-charcoal/35 p-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bronze/25 bg-bronze/5 text-bronze">
              <MailQuestion className="h-5 w-5" strokeWidth={1.3} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-light text-foreground">
                Waiting for confirmation
                <Spinner size="sm" label="Waiting for email confirmation" />
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground/50">
                This page updates automatically once the link is opened.
              </p>
            </div>
          </div>

          {resend.state === "success" ? (
            <SuccessMessage>
              A new confirmation email is on its way. Check spam if it doesn't arrive shortly.
            </SuccessMessage>
          ) : null}

          <div className="space-y-3">
            <AuthSubmitButton
              type="button"
              pending={confirm.state === "pending"}
              pendingLabel="Checking"
              onClick={() => void confirm.run()}
            >
              I've verified my email
            </AuthSubmitButton>
            <GeoButton
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={resend.isPending || cooldown > 0}
              onClick={() => void onResend()}
            >
              {resend.isPending
                ? "Sending…"
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend email"}
            </GeoButton>
            <GeoButton asChild variant="ghost" size="lg" className="w-full">
              <Link to="/auth/login">Return to sign in</Link>
            </GeoButton>
          </div>
        </div>
      </AuthLayout>
    </PageShell>
  );
}
