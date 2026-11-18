import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AuthLayout,
  AuthSubmitButton,
  SuccessBurst,
  ValidationMessage,
} from "@/features/auth/components";
import { PasswordField, PasswordStrengthMeter } from "@/features/auth/components/PasswordField";
import {
  collectErrors,
  resetPasswordSchema,
  type FieldErrors,
  type ResetPasswordValues,
} from "@/features/auth/lib/schemas";
import { completeBrowserAuthCallback, replaceAuthCallbackUrl } from "@/features/auth/lib/completeBrowserAuthCallback";
import { mapAuthError } from "@/features/auth/lib/oauth";
import { useMockRequest } from "@/features/auth/lib/useMockRequest";
import { supabase } from "@/lib/supabase/client";

/** Set a new password from a recovery link. */
export function ResetPasswordPage() {
  const [values, setValues] = useState<ResetPasswordValues>({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors<ResetPasswordValues>>({});
  const [linkError, setLinkError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const { state, error, run, reset } = useMockRequest();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    void (async () => {
      const result = await completeBrowserAuthCallback(window.location.href);
      if (cancelled) return;
      if (result.status === "session") {
        replaceAuthCallbackUrl("/auth/reset-password");
        setSessionReady(true);
        return;
      }
      const existing = (await supabase.auth.getSession()).data.session;
      if (existing?.user) {
        replaceAuthCallbackUrl("/auth/reset-password");
        setSessionReady(true);
        return;
      }
      if (result.status === "error") {
        replaceAuthCallbackUrl("/auth/reset-password");
        setLinkError(result.message);
        return;
      }
      setLinkError("Open the reset link from your email to choose a new password. The link expires after a short time.");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = <K extends keyof ResetPasswordValues>(key: K, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (state === "error") reset();
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors<ResetPasswordValues>(parsed.error));
      return;
    }
    setErrors({});
    await run({
      action: async () => {
        // A valid recovery link is exchanged once by completeBrowserAuthCallback.
        const { error: updateError } = await supabase.auth.updateUser({
          password: parsed.data.password,
        });
        if (updateError) return { ok: false, error: mapAuthError(updateError.message) };
        return { ok: true };
      },
    });
  };

  return (
    <PageShell className="pb-0">
      <AuthLayout
        eyebrow="Recovery"
        title={state === "success" ? "Password updated" : "Choose a new password"}
        {...(state === "success"
          ? {}
          : { description: "Pick something strong — every requirement below has to be met." })}
      >
        {state === "success" ? (
          <SuccessBurst
            icon={<ShieldCheck className="h-7 w-7" strokeWidth={1.2} aria-hidden="true" />}
            title="You're all set"
            description="Your password has been changed. Sign in with your new credentials to continue exploring."
          >
            <AuthSubmitButton asChild>
              <Link to="/auth/login" search={{ redirect: undefined }}>
                Back to sign in
              </Link>
            </AuthSubmitButton>
          </SuccessBurst>
        ) : (
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            {linkError ? <ValidationMessage>{linkError}</ValidationMessage> : null}
            {error ? <ValidationMessage>{error}</ValidationMessage> : null}
            <PasswordField
              id="password"
              label="New password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              {...(errors.password ? { error: errors.password } : {})}
              required
            />
            <PasswordStrengthMeter value={values.password} />
            <PasswordField
              id="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              {...(errors.confirmPassword ? { error: errors.confirmPassword } : {})}
              required
            />
            <AuthSubmitButton
              pending={state === "pending"}
              pendingLabel="Updating password"
              disabled={!sessionReady || Boolean(linkError)}
            >
              Update password
            </AuthSubmitButton>
          </form>
        )}
      </AuthLayout>
    </PageShell>
  );
}
