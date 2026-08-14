import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { GeoButton } from "@/components/shared/GeoButton";
import {
  AuthField,
  AuthLayout,
  AuthSubmitButton,
  SuccessBurst,
  ValidationMessage,
} from "@/features/auth/components";
import {
  collectErrors,
  forgotPasswordSchema,
  type FieldErrors,
  type ForgotPasswordValues,
} from "@/features/auth/lib/schemas";
import { demoFailureFor, useMockRequest } from "@/features/auth/lib/useMockRequest";

/** Request a reset link. */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors<ForgotPasswordValues>>({});
  const { state, error, run, reset } = useMockRequest();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors(collectErrors<ForgotPasswordValues>(parsed.error));
      return;
    }
    setErrors({});
    await run({ failWith: demoFailureFor(email) });
  };

  return (
    <PageShell>
      <AuthLayout
        eyebrow="Recovery"
        title={state === "success" ? "Check your inbox" : "Reset your password"}
        {...(state === "success"
          ? {}
          : {
              description:
                "Enter the email tied to your account and we'll send a secure reset link.",
            })}
        footer={
          <p>
            Remembered it?{" "}
            <Link to="/auth/login" className="text-bronze transition-colors hover:text-bronze-glow">
              Back to sign in
            </Link>
          </p>
        }
      >
        {state === "success" ? (
          <SuccessBurst
            icon={<MailCheck className="h-7 w-7" strokeWidth={1.2} aria-hidden="true" />}
            title="Reset link sent"
            description={`If ${email} belongs to a GEOverze account, a reset link is on its way. The link expires in 30 minutes.`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <GeoButton asChild variant="primary">
                <Link to="/auth/reset-password">Open reset screen</Link>
              </GeoButton>
              <GeoButton variant="ghost" onClick={reset}>
                Use a different email
              </GeoButton>
            </div>
          </SuccessBurst>
        ) : (
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            {error ? <ValidationMessage>{error}</ValidationMessage> : null}
            <AuthField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({});
                if (state === "error") reset();
              }}
              {...(errors.email ? { error: errors.email } : {})}
              required
            />
            <AuthSubmitButton pending={state === "pending"} pendingLabel="Sending link">
              Send reset link
            </AuthSubmitButton>
          </form>
        )}
      </AuthLayout>
    </PageShell>
  );
}
