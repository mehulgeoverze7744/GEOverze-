import { Link } from "@tanstack/react-router";
import { Compass, Home } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { mainNav } from "@/config/site";

/**
 * Single not-found surface. Used by the `/404` route and by the router's
 * not-found boundary so an unknown URL and an explicit 404 look identical.
 */
export function NotFoundPage() {
  return (
    <PageShell>
      <section className="flex min-h-[calc(100vh-var(--nav-height))] items-center pt-[calc(var(--nav-height)+3rem)] pb-[var(--space-section-sm)]">
        <SectionContainer>
          <AnimatedSection>
            <GlassCard strong className="overflow-hidden p-10 text-center md:p-16">
              <p className="eyebrow">Off the map</p>
              <p className="mt-6 font-light leading-none text-gradient-bronze text-[clamp(4rem,13vw,9rem)]">
                404
              </p>
              <h1 className="mt-6 font-light tracking-tight text-foreground text-[clamp(1.4rem,3vw,2rem)]">
                This coordinate doesn't exist
              </h1>
              <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-foreground/50">
                The page you were looking for has drifted out of orbit. Pick a heading below and
                we'll take you back to charted territory.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <GeoButton asChild variant="primary" size="lg">
                  <Link to="/">
                    <Home className="h-4 w-4" strokeWidth={1.5} />
                    Return home
                  </Link>
                </GeoButton>
                <GeoButton asChild variant="secondary" size="lg">
                  <Link to="/play">
                    <Compass className="h-4 w-4" strokeWidth={1.5} />
                    Let's Play
                  </Link>
                </GeoButton>
              </div>

              <div className="mt-12 border-t border-bronze/12 pt-8">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-bronze/90">
                  Explore instead
                </p>
                <nav className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-3">
                  {mainNav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/50 transition-colors hover:text-bronze"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </GlassCard>
          </AnimatedSection>
        </SectionContainer>
      </section>
    </PageShell>
  );
}
