import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { pricingFaq } from "../data/faq";

/** Membership FAQ. */
export function PricingFaq() {
  return (
    <section aria-labelledby="faq-heading" className="pb-[var(--space-section-sm)]">
      <SectionContainer>
        <SectionHeading
          eyebrow="Questions"
          title="Membership, answered"
          description="How plans, credits and creator access will work once billing is live."
          className="mb-12"
        />
        <AnimatedSection>
          <GlassCard strong className="px-7 py-4 md:px-10 md:py-6">
            <Accordion type="single" collapsible className="w-full">
              {pricingFaq.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-b border-bronze/12 last:border-0"
                >
                  <AccordionTrigger className="min-h-11 py-6 text-left text-sm font-normal text-foreground/85 no-underline hover:no-underline hover:text-bronze-glow">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="max-w-2xl pb-7 text-sm leading-relaxed text-foreground/55">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </GlassCard>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
}
