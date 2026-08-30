import { useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";

import { usePricingCatalog } from "../hooks/usePricingCatalog";
import type { BillingCycle } from "../data/plans";
import { BillingToggle } from "../components/BillingToggle";
import { ComparisonTable } from "../components/ComparisonTable";
import { PlanGrid } from "../components/PlanGrid";
import { PricingCta } from "../components/PricingCta";
import { PricingFaq } from "../components/PricingFaq";

/** Dedicated, deep-linkable feature comparison. */
export function ComparePlansScreen() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const { plans, comparisonGroups, loading, error } = usePricingCatalog();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Compare"
        title="Every feature, side by side"
        description="The complete capability matrix across Explorer, Basic, Pro and Advance."
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

      <PlanGrid cycle={cycle} plans={plans} loading={loading} error={error} />
      <ComparisonTable
        heading={false}
        plans={plans}
        comparisonGroups={comparisonGroups}
        loading={loading}
        error={error}
      />
      <PricingFaq />
      <PricingCta />
    </PageShell>
  );
}
