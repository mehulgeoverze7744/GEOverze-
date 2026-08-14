import type { LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AnimatedSection } from "./AnimatedSection";
import { SectionContainer } from "./SectionContainer";
import { Breadcrumb } from "./Breadcrumb";

/** Standard hero block for every internal page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: { label: string; to?: NonNullable<LinkProps["to"]> }[];
  children?: ReactNode;
}) {
  return (
    <header className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-12">
      <SectionContainer>
        {breadcrumb ? <Breadcrumb items={breadcrumb} className="mb-8" /> : null}
        <AnimatedSection>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-4 max-w-3xl font-light leading-[1.02] tracking-tight text-foreground text-[clamp(2.2rem,5vw,3.9rem)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-9">{children}</div> : null}
        </AnimatedSection>
      </SectionContainer>
    </header>
  );
}
