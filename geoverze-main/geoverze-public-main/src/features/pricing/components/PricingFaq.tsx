import { ChevronDown } from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { pricingFaq } from "../data/faq";
import { PricingSectionHeader } from "./PricingSectionHeader";
import "../styles/pricing-editorial.css";

/** Minimal membership FAQ accordion. */
export function PricingFaq() {
  return (
    <section aria-labelledby="faq-heading" className="pricing-faq-section">
      <SectionContainer>
        <PricingSectionHeader
          id="faq-heading"
          eyebrow="Questions"
          title="Membership, answered"
          description="How plans, credits and creator access will work once billing is live."
        />

        <AnimatedSection>
          <Accordion type="single" collapsible className="pricing-faq-accordion">
            {pricingFaq.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="pricing-faq-item border-none">
                <AccordionTrigger className="pricing-faq-trigger hover:no-underline [&>svg:last-child]:hidden">
                  {item.question}
                  <ChevronDown className="pricing-faq-chevron h-4 w-4" strokeWidth={1.5} aria-hidden />
                </AccordionTrigger>
                <AccordionContent className="pricing-faq-content">
                  <p className="pricing-faq-answer">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
}
