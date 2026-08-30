import { useState } from "react";

import { PageShell } from "@/components/layout/PageShell";

import { usePricingCatalog } from "../hooks/usePricingCatalog";
import type { BillingCycle } from "../data/plans";
import { BenefitGrid } from "./BenefitGrid";
import { ComparisonTable } from "./ComparisonTable";
import { CreatorMembership } from "./CreatorMembership";
import { PlanGrid } from "./PlanGrid";
import { PricingCta } from "./PricingCta";
import { PricingFaq } from "./PricingFaq";
import { PricingHero } from "./PricingHero";
import { RewardsExplainer } from "./RewardsExplainer";
import { SuccessStories } from "./SuccessStories";
import { WhyUpgrade } from "./WhyUpgrade";

/** Pricing home — the full membership story. Nothing billable yet. */
export function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const { plans, comparisonGroups, loading, error } = usePricingCatalog();

  return (
    <PageShell>
      <PricingHero cycle={cycle} onCycleChange={setCycle} />
      <PlanGrid cycle={cycle} plans={plans} loading={loading} error={error} />
      <BenefitGrid />
      <WhyUpgrade />
      <ComparisonTable
        plans={plans}
        comparisonGroups={comparisonGroups}
        loading={loading}
        error={error}
      />
      <RewardsExplainer />
      <CreatorMembership />
      <SuccessStories />
      <PricingFaq />
      <PricingCta />
    </PageShell>
  );
}
