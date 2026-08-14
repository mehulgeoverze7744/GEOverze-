import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useEffect } from "react";

import { notificationSeeds } from "@/features/profile/data/notifications";
import { useNotificationsStore } from "@/stores/notificationsStore";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { useAuthStore } from "@/stores/authStore";

/**
 * Account area gate.
 *
 * There is no auth backend yet, so this reads the client session store and
 * renders an inline sign-in wall instead of redirecting — the URL stays intact
 * and the page never flashes protected content. When real sessions land, this
 * is the single place that changes.
 */
export const Route = createFileRoute("/_app")({
  component: AccountArea,
});

function AccountArea() {
  const status = useAuthStore((s) => s.status);
  const seed = useNotificationsStore((s) => s.seed);

  // Placeholder notices so the centre and bell are populated before a backend.
  useEffect(() => {
    if (status === "signed-in") seed(notificationSeeds());
  }, [status, seed]);

  if (status === "signed-in") return <Outlet />;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Account"
        title="Sign in to continue"
        description="This area belongs to your GEOverze account. Accounts activate in the authentication phase — the screens are finished and waiting on their backend."
      />
      <SectionContainer>
        <AnimatedSection>
          <GlassCard strong className="flex flex-col items-center px-8 py-14 text-center">
            <span className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-full border border-bronze/25 bg-bronze/5 text-bronze">
              <Lock className="h-5 w-5" strokeWidth={1.3} />
            </span>
            <h2 className="text-lg font-light tracking-tight text-foreground">Protected area</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/50">
              Your profile, progress and settings live behind this gate so nothing personal is ever
              rendered without a session.
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
  );
}
