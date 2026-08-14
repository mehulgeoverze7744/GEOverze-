import { useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";

import type { BillingCycle } from "../data/plans";
import { BillingToggle } from "../components/BillingToggle";
import { ComparisonTable } from "../components/ComparisonTable";
import { PlanGrid } from "../components/PlanGrid";
import { PricingCta } from "../components/PricingCta";
import { PricingFaq } from "../components/PricingFaq";
import { SectionContainer } from "@/components/shared/SectionContainer";

/** Dedicated, deep-linkable feature comparison. */
export function ComparePlansScreen() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Compare"
        title="Every feature, side by side"
        description="The complete capability matrix across Explorer, Pro and Advance."
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Pricing", to: "/pricing" },
          { label: "Compare" },
        ]}
      />

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="wide">
          <BillingToggle cycle={cycle} onChange={setCycle} />
        </SectionContainer>
      </section>

      <PlanGrid cycle={cycle} />
      <ComparisonTable heading={false} />
      <PricingFaq />
      <PricingCta />
    </PageShell>
  );
}
