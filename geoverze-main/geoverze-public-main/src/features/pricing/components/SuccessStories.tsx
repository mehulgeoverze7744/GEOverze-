import { Quote } from "lucide-react";
import { memo } from "react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";

import { testimonials, type Testimonial } from "../data/testimonials";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

export const TestimonialCard = memo(function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <GlassCard interactive className="flex h-full flex-col p-8">
      <Quote className="h-5 w-5 text-bronze/90" strokeWidth={1.4} aria-hidden />
      <blockquote className="mt-6 flex-1 text-sm leading-relaxed text-foreground/70">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-4 border-t border-bronze/10 pt-6">
        <span
          aria-hidden
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bronze/25 bg-bronze/10 text-[0.65rem] uppercase tracking-[0.15em] text-bronze"
        >
          {initials(testimonial.name)}
        </span>
        <span className="min-w-0">
          <span className="block text-sm text-foreground/85">{testimonial.name}</span>
          <span className="block text-xs text-foreground/50">{testimonial.role}</span>
        </span>
      </figcaption>
      <p className="mt-4 text-[0.6rem] uppercase tracking-[0.26em] text-bronze/90">
        {testimonial.plan} · {testimonial.stat}
      </p>
    </GlassCard>
  );
});

/** Success stories. Clearly labelled as illustrative. */
export function SuccessStories() {
  return (
    <section aria-labelledby="stories-heading" className="pb-[var(--space-section-sm)]">
      <SectionContainer size="wide">
        <SectionHeading
          eyebrow="Success stories"
          title="Illustrative, for now"
          description="Placeholder voices from a creator, an explorer and a premium member — replaced with real ones after launch."
          className="mb-12"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <AnimatedSection key={testimonial.id} delay={i * 80} className="h-full">
              <figure className="h-full">
                <TestimonialCard testimonial={testimonial} />
              </figure>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
