import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { GeoButton } from "@/components/shared/GeoButton";
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
import { useMockRequest } from "@/features/auth/lib/useMockRequest";
import { supabase } from "@/lib/supabase/client";

/** Set a new password from a recovery link. */
export function ResetPasswordPage() {
  const [values, setValues] = useState<ResetPasswordValues>({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors<ResetPasswordValues>>({});
  const { state, error, run, reset } = useMockRequest();

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
        // Reaching this page via a valid recovery link already established a
        // recovery session (supabase-js reads it from the URL on load).
        const { error: updateError } = await supabase.auth.updateUser({
          password: parsed.data.password,
        });
        if (updateError) return { ok: false, error: updateError.message };
        return { ok: true };
      },
    });
  };

  return (
    <PageShell>
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
            <GeoButton asChild variant="primary" className="w-full sm:w-auto">
              <Link to="/auth/login">Back to sign in</Link>
            </GeoButton>
          </SuccessBurst>
        ) : (
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
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
            <AuthSubmitButton pending={state === "pending"} pendingLabel="Updating password">
              Update password
            </AuthSubmitButton>
          </form>
        )}
      </AuthLayout>
    </PageShell>
  );
}
