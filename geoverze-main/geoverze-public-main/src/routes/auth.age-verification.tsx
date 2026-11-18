import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { Spinner } from "@/components/shared/Spinner";
import { AuthLayout } from "@/features/auth/components";
import { resolvePostAuthDestination } from "@/features/auth/lib/oauth";
import { selectIsSignedIn, selectUser, useAuthStore } from "@/stores/authStore";

/**
 * Legacy URL. Age confirmation is no longer an onboarding step.
 * Send visitors to login, remaining profile setup, or their signed-in home.
 */
function AgeVerificationRedirect() {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const signedIn = useAuthStore(selectIsSignedIn);
  const user = useAuthStore(selectUser);

  useEffect(() => {
    if (status === "unknown") return;
    let cancelled = false;

    void (async () => {
      if (!signedIn || !user?.id) {
        await navigate({ to: "/auth/login", search: { redirect: undefined }, replace: true });
        return;
      }
      const destination = await resolvePostAuthDestination(user.id, null);
      if (cancelled) return;
      if (destination === "/auth/age-verification") {
        await navigate({ to: "/auth/onboarding", replace: true });
        return;
      }
      await navigate({ to: destination as never, replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, signedIn, status, user?.id]);

  return (
    <PageShell className="pb-0">
      <AuthLayout
        eyebrow="Welcome"
        title="Continuing"
        description="Taking you to the next step of your GVRZE account."
      >
        <div className="flex items-center gap-3 text-[14px] text-[#86868B]">
          <Spinner label="Continuing" />
          <span>Please wait…</span>
        </div>
      </AuthLayout>
    </PageShell>
  );
}

export const Route = createFileRoute("/auth/age-verification")({
  head: () => ({
    meta: [
      { title: "Continuing — GVRZE" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgeVerificationRedirect,
});
