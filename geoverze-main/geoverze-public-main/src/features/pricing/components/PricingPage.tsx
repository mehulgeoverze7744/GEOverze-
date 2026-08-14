import { useState } from "react";

import { PageShell } from "@/components/layout/PageShell";

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

  return (
    <PageShell>
      <PricingHero cycle={cycle} onCycleChange={setCycle} />
      <PlanGrid cycle={cycle} />
      <BenefitGrid />
      <WhyUpgrade />
      <ComparisonTable />
      <RewardsExplainer />
      <CreatorMembership />
      <SuccessStories />
      <PricingFaq />
      <PricingCta />
    </PageShell>
  );
}
