import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { shouldShowSignIn } from "@/lib/supabase/authLifecycle";
import { useAuthStore } from "@/stores/authStore";

import "@/features/profile/styles/account-pages-light.css";

function AccountChrome({ children }: { children: ReactNode }) {
  return (
    <div id="gvrze-account">
      <div className="gvrze-account-bg" aria-hidden="true" />
      {children}
    </div>
  );
}

/**
 * Account area gate.
 *
 * Reads the Supabase-backed session mirror (`useAuthStore`) and renders an
 * inline sign-in wall instead of redirecting. While the session is still
 * being restored the wall is not shown: that state is not a signed-out user.
 * The URL stays intact and protected content stays mounted once signed in.
 */
export const Route = createFileRoute("/_app")({
  component: AccountArea,
});

function AccountArea() {
  const status = useAuthStore((s) => s.status);

  if (status === "signed-in")
    return (
      <AccountChrome>
        <Outlet />
      </AccountChrome>
    );

  if (!shouldShowSignIn(status)) {
    return (
      <AccountChrome>
        <PageShell>
          <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
            <div aria-busy="true" aria-live="polite">
              <SkeletonBlock variant="card" />
            </div>
          </SectionContainer>
        </PageShell>
      </AccountChrome>
    );
  }

  return (
    <AccountChrome>
      <PageShell>
        <PageHeader
          eyebrow="Account"
          title="Sign in to continue"
          description="This area belongs to your GVRZE account. Sign in to pick up where you left off."
        />
        <SectionContainer>
          <AnimatedSection>
            <GlassCard strong className="flex flex-col items-center px-8 py-14 text-center">
              <span className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-full border border-bronze/25 bg-bronze/5 text-bronze">
                <Lock className="h-5 w-5" strokeWidth={1.3} />
              </span>
              <h2 className="text-lg font-light tracking-tight text-foreground">Protected area</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/50">
                Your profile, progress and settings live behind this gate so nothing personal is
                ever rendered without a session.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <GeoButton asChild variant="primary">
                  <Link to="/auth/login">Sign in</Link>
                </GeoButton>
                <GeoButton asChild variant="secondary">
                  <Link to="/auth/signup">Create account</Link>
                </GeoButton>
              </div>
            </GlassCard>
          </AnimatedSection>
        </SectionContainer>
      </PageShell>
    </AccountChrome>
  );
}
