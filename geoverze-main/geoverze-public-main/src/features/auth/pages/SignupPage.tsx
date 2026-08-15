import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import {
  AuthCheckbox,
  AuthDivider,
  AuthField,
  AuthLayout,
  AuthSubmitButton,
  CountrySelect,
  SocialButton,
  ValidationMessage,
} from "@/features/auth/components";
import { PasswordField, PasswordStrengthMeter } from "@/features/auth/components/PasswordField";
import {
  collectErrors,
  signupSchema,
  type FieldErrors,
  type SignupValues,
} from "@/features/auth/lib/schemas";
import { useMockRequest } from "@/features/auth/lib/useMockRequest";
import { supabase } from "@/lib/supabase/client";

const EMPTY: SignupValues = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  country: "",
  acceptTerms: true,
  acceptPrivacy: true,
  newsletter: false,
};

/** Account creation. On success the journey chains into email verification. */
export function SignupPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<SignupValues>({
    ...EMPTY,
    acceptTerms: false as unknown as true,
    acceptPrivacy: false as unknown as true,
  });
  const [errors, setErrors] = useState<FieldErrors<SignupValues>>({});
  const { state, error, run, reset } = useMockRequest();

  const update = <K extends keyof SignupValues>(key: K, value: SignupValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (state === "error") reset();
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors<SignupValues>(parsed.error));
      return;
    }
    setErrors({});
    const ok = await run({
      action: async () => {
        const { error: signUpError } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: {
              username: parsed.data.username,
              display_name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
              first_name: parsed.data.firstName,
              last_name: parsed.data.lastName,
              country_code: parsed.data.country.toUpperCase(),
            },
            ...(typeof window !== "undefined"
              ? {
                  emailRedirectTo: `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(parsed.data.email)}`,
                }
              : {}),
          },
        });
        if (signUpError) return { ok: false, error: signUpError.message };
        return { ok: true };
      },
    });
    if (ok) {
      navigate({ to: "/auth/verify-email", search: { email: parsed.data.email } });
    }
  };

  return (
    <PageShell>
      <AuthLayout
        width="wide"
        eyebrow="Create your account"
        title="Join GEOverze"
        description="Know Earth. Think Global. Build your explorer profile in under a minute."
        footer={
          <p>
            Already exploring?{" "}
            <Link to="/auth/login" className="text-bronze transition-colors hover:text-bronze-glow">
              Sign in
            </Link>
          </p>
        }
      >
        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          {error ? <ValidationMessage>{error}</ValidationMessage> : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <AuthField
              id="firstName"
              label="First name"
              autoComplete="given-name"
              placeholder="Ada"
              value={values.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              {...(errors.firstName ? { error: errors.firstName } : {})}
              required
            />
            <AuthField
              id="lastName"
              label="Last name"
              autoComplete="family-name"
              placeholder="Lovelace"
              value={values.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              {...(errors.lastName ? { error: errors.lastName } : {})}
              required
            />
            <AuthField
              id="username"
              label="Username"
              autoComplete="username"
              placeholder="atlas_ada"
              hint="Visible on leaderboards."
              value={values.username}
              onChange={(e) => update("username", e.target.value)}
              {...(errors.username ? { error: errors.username } : {})}
              required
            />
            <AuthField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              {...(errors.email ? { error: errors.email } : {})}
              required
            />
          </div>

          <CountrySelect
            id="country"
            value={values.country}
            onChange={(code) => update("country", code)}
            {...(errors.country ? { error: errors.country } : {})}
            required
          />

          <div className="space-y-5">
            <PasswordField
              id="password"
              label="Password"
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
              label="Confirm password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              {...(errors.confirmPassword ? { error: errors.confirmPassword } : {})}
              required
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-bronze/12 bg-charcoal/30 p-4">
            <AuthCheckbox
              id="acceptTerms"
              checked={values.acceptTerms}
              onChange={(e) => update("acceptTerms", e.target.checked as unknown as true)}
              {...(errors.acceptTerms ? { error: errors.acceptTerms } : {})}
              label={
                <>
                  I accept the{" "}
                  <Link to="/terms" className="text-bronze hover:text-bronze-glow">
                    Terms of Service
                  </Link>
                  .
                </>
              }
            />
            <AuthCheckbox
              id="acceptPrivacy"
              checked={values.acceptPrivacy}
              onChange={(e) => update("acceptPrivacy", e.target.checked as unknown as true)}
              {...(errors.acceptPrivacy ? { error: errors.acceptPrivacy } : {})}
              label={
                <>
                  I accept the{" "}
                  <Link to="/privacy" className="text-bronze hover:text-bronze-glow">
                    Privacy Policy
                  </Link>
                  .
                </>
              }
            />
            <AuthCheckbox
              id="newsletter"
              checked={values.newsletter}
              onChange={(e) => update("newsletter", e.target.checked)}
              label="Send me new expeditions, seasons and world events (optional)."
            />
          </div>

          <AuthSubmitButton pending={state === "pending"} pendingLabel="Creating account">
            Create account
          </AuthSubmitButton>

          <AuthDivider />

          <div className="grid gap-3 sm:grid-cols-2">
            <SocialButton provider="google" />
            <SocialButton provider="apple" />
          </div>
        </form>
      </AuthLayout>
    </PageShell>
  );
}
