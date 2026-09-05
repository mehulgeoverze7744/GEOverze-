import { SegmentedControl } from "@/components/shared/SegmentedControl";

import type { PricingPlan, TierId } from "../data/plans";
import { TIER_ORDER } from "../data/plans";

type PlanTierSelectorProps = {
  plans: PricingPlan[];
  value: TierId;
  onChange: (tier: TierId) => void;
  className?: string;
};

/** Four-tier bronze segmented selector for the comparison matrix. */
export function PlanTierSelector({ plans, value, onChange, className }: PlanTierSelectorProps) {
  const ordered = TIER_ORDER.flatMap((tier) => {
    const plan = plans.find((entry) => entry.id === tier);
    return plan ? [{ id: tier, label: plan.name }] : [];
  });

  return (
    <SegmentedControl
      options={ordered}
      value={value}
      onChange={onChange}
      variant="bronze"
      ariaLabel="Membership plan comparison"
      fullWidth
      className={className}
    />
  );
}
