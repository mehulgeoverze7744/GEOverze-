import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import {
  AuthCheckbox,
  AuthDivider,
  AuthField,
  AuthLayout,
  AuthSubmitButton,
  SocialButton,
  SuccessBurst,
  ValidationMessage,
} from "@/features/auth/components";
import {
  collectErrors,
  loginSchema,
  type FieldErrors,
  type LoginValues,
} from "@/features/auth/lib/schemas";
import {
  DEMO_FAILING_EMAIL,
  demoFailureFor,
  useMockRequest,
} from "@/features/auth/lib/useMockRequest";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { useAuthStore } from "@/stores/authStore";

/** Sign-in screen. Frontend-only: a successful submit sets the local session. */
export function LoginPage() {
  const navigate = useNavigate();
  const signInAsDemo = useAuthStore((s) => s.signInAsDemo);
  const [values, setValues] = useState<LoginValues>({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const { state, error, run, reset } = useMockRequest();

  const update = <K extends keyof LoginValues>(key: K, value: LoginValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (state === "error") reset();
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors<LoginValues>(parsed.error));
      return;
    }
    setErrors({});
    const ok = await run({ failWith: demoFailureFor(values.email) });
    if (ok) {
      signInAsDemo({
        email: parsed.data.email,
        displayName: parsed.data.email.split("@")[0] ?? "Explorer",
      });
      setTimeout(() => navigate({ to: "/profile" }), 1200);
    }
  };

  if (state === "success") {
    return (
      <PageShell>
        <AuthLayout title="Welcome back to GEOverze" description="Signing you in…">
          <SuccessBurst
            title="Signed in"
            description="Taking you to your explorer profile — the world is where you left it."
          />
        </AuthLayout>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AuthLayout
        eyebrow="Welcome back"
        title="Sign in to GEOverze"
        description="Continue your progress across the geography universe."
        footer={
          <p>
            New here?{" "}
            <Link
              to="/auth/signup"
              className="text-bronze transition-colors hover:text-bronze-glow"
            >
              Create an account
            </Link>
          </p>
        }
      >
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {error ? <ValidationMessage>{error}</ValidationMessage> : null}

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
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            {...(errors.password ? { error: errors.password } : {})}
            required
          />

          <div className="flex items-center justify-between gap-4">
            <AuthCheckbox
              id="remember"
              label="Remember me"
              checked={values.remember}
              onChange={(e) => update("remember", e.target.checked)}
            />
            <Link
              to="/auth/forgot-password"
              className="text-xs text-foreground/50 transition-colors hover:text-bronze"
            >
              Forgot password?
            </Link>
          </div>

          <AuthSubmitButton pending={state === "pending"} pendingLabel="Signing in">
            Sign in
          </AuthSubmitButton>

          <p className="text-center text-[0.68rem] text-foreground/50">
            Demo build — any valid email signs you in. Use {DEMO_FAILING_EMAIL} to preview the error
            state.
          </p>

          <AuthDivider />

          <div className="space-y-3">
            <SocialButton provider="google" />
            <SocialButton provider="apple" />
          </div>
        </form>
      </AuthLayout>
    </PageShell>
  );
}
