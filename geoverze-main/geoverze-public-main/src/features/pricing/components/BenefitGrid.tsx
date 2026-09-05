import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";

import { membershipBenefits } from "../data/benefits";
import { BenefitItem } from "./BenefitItem";
import "../styles/pricing-benefits.css";

/** Horizontal editorial benefits strip — premium product specification. */
export function BenefitGrid() {
  return (
    <section aria-labelledby="benefits-heading" className="pricing-benefits-section">
      <SectionContainer size="wide">
        <header className="pricing-benefits-header">
          <p className="eyebrow">Benefits</p>
          <h2 id="benefits-heading" className="font-light tracking-tight text-foreground">
            What membership actually gives you
          </h2>
          <p>Seven things that change the moment you upgrade.</p>
        </header>

        <div className="pricing-benefits-strip-wrap">
          <div className="pricing-benefits-strip" role="list">
            {membershipBenefits.map((benefit, i) => (
              <AnimatedSection
                key={benefit.title}
                delay={i * 70}
                className="pricing-benefits-strip-cell"
                role="listitem"
              >
                <BenefitItem index={i} title={benefit.title} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
