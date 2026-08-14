import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { BrandMark } from "@/components/shared/BrandMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { cn } from "@/lib/utils";

/**
 * Centered glass card shared by every auth screen.
 *
 * `width` widens the panel for multi-column forms (signup) and step flows
 * (onboarding) without any screen re-implementing the shell.
 */
export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
  aside,
  width = "narrow",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Rendered between the heading block and the content (stepper, meta). */
  aside?: ReactNode;
  width?: "narrow" | "wide";
  className?: string;
}) {
  return (
    <section className="flex min-h-[calc(100vh-var(--nav-height))] items-center py-[var(--space-section-sm)] pt-[calc(var(--nav-height)+3rem)]">
      <SectionContainer size={width === "wide" ? "default" : "narrow"}>
        <AnimatedSection>
          <GlassCard
            strong
            className={cn(
              "mx-auto p-7 sm:p-9 md:p-11",
              width === "wide" ? "max-w-3xl" : "max-w-md",
              className,
            )}
          >
            <Link
              to="/"
              aria-label="GEOverze home"
              className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
            >
              <BrandMark
                size="md"
                withWordmark
                wordmarkClassName="text-[0.68rem] tracking-[0.36em] text-foreground/70"
              />
            </Link>

            {eyebrow ? <p className="eyebrow mt-8 sm:mt-9">{eyebrow}</p> : null}
            <h1 className="mt-4 font-light leading-[1.1] tracking-tight text-foreground text-[clamp(1.6rem,3vw,2.1rem)]">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 text-sm leading-relaxed text-foreground/55">{description}</p>
            ) : null}

            {aside ? <div className="mt-8">{aside}</div> : null}

            <div className="mt-8 sm:mt-9">{children}</div>

            {footer ? (
              <div className="mt-8 border-t border-bronze/12 pt-6 text-sm text-foreground/50">
                {footer}
              </div>
            ) : null}
          </GlassCard>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
}
