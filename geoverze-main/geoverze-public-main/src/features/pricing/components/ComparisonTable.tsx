import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Minus } from "lucide-react";

import { SectionContainer } from "@/components/shared/SectionContainer";
import { cn } from "@/lib/utils";

import type { ComparisonGroup, ComparisonValue } from "../data/comparison";
import type { PricingPlan, TierId } from "../data/plans";
import { PlanTierSelector } from "./PlanTierSelector";
import { PricingSectionHeader } from "./PricingSectionHeader";
import "../styles/pricing-editorial.css";

function ValueCell({ value }: { value: ComparisonValue }) {
  if (value === true)
    return (
      <>
        <Check className="mx-auto h-4 w-4 text-bronze" strokeWidth={1.7} aria-hidden />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false)
    return (
      <>
        <Minus className="mx-auto h-4 w-4 text-foreground/50" strokeWidth={1.4} aria-hidden />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span>{value}</span>;
}

function tierDataAttr(id: TierId) {
  if (id === "pro" || id === "advance") return id;
  return undefined;
}

function defaultTier(plans: PricingPlan[]): TierId {
  return plans.find((plan) => plan.id === "explorer")?.id ?? plans[0]?.id ?? "explorer";
}

/** Premium editorial membership comparison — spec sheet, not boxed table. */
export function ComparisonTable({
  heading = true,
  plans,
  comparisonGroups,
  loading = false,
  error = null,
}: {
  heading?: boolean;
  plans: PricingPlan[];
  comparisonGroups: ComparisonGroup[];
  loading?: boolean;
  error?: string | null;
}) {
  const [selectedTier, setSelectedTier] = useState<TierId>(() => defaultTier(plans));
  const scrollRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Partial<Record<TierId, HTMLTableCellElement | null>>>({});

  useEffect(() => {
    if (plans.length === 0) return;
    setSelectedTier((current) =>
      plans.some((plan) => plan.id === current) ? current : defaultTier(plans),
    );
  }, [plans]);

  const scrollToTier = useCallback((tier: TierId) => {
    const column = columnRefs.current[tier];
    const container = scrollRef.current;
    if (!column || !container) return;

    const targetLeft =
      column.offsetLeft - container.clientWidth / 2 + column.offsetWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, []);

  const onTierChange = useCallback(
    (tier: TierId) => {
      setSelectedTier(tier);
      scrollToTier(tier);
    },
    [scrollToTier],
  );

  useEffect(() => {
    scrollToTier(selectedTier);
  }, [selectedTier, scrollToTier, plans.length]);

  if (error) {
    return (
      <section aria-labelledby="compare-heading" className="pricing-compare-section">
        <SectionContainer size="wide">
          <p className="pricing-compare-state">{`Plan comparison could not be loaded. ${error}`}</p>
        </SectionContainer>
      </section>
    );
  }

  if (loading || plans.length === 0) {
    return (
      <section aria-labelledby="compare-heading" className="pricing-compare-section">
        <SectionContainer size="wide">
          <div className="pricing-compare-state pricing-compare-state--loading" aria-hidden />
        </SectionContainer>
      </section>
    );
  }

  return (
    <section aria-labelledby="compare-heading" className="pricing-compare-section">
      <SectionContainer size="wide">
        {heading ? (
          <PricingSectionHeader
            id="compare-heading"
            eyebrow="Compare"
            title="What each membership includes"
            description="Every capability across the platform, plan by plan."
          />
        ) : (
          <h2 id="compare-heading" className="sr-only">
            Plan comparison
          </h2>
        )}

        <div ref={scrollRef} className="pricing-compare-scroll">
          <div className="pricing-compare-sheet">
            <div className="pricing-compare-controls">
              <p className="pricing-compare-feature-heading" id="compare-feature-col">
                Feature
              </p>
              <PlanTierSelector
                plans={plans}
                value={selectedTier}
                onChange={onTierChange}
                className="pricing-compare-selector"
              />
            </div>

            <table className="pricing-compare-table" aria-describedby="compare-feature-col">
              <caption className="sr-only">GEOverze membership feature comparison</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} scope="col">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {comparisonGroups.map((group, groupIndex) => (
                <tbody key={group.title}>
                  <tr className="pricing-compare-category">
                    <th scope="colgroup" colSpan={plans.length + 1}>
                      {group.title}
                    </th>
                  </tr>
                  {group.rows.map((row, rowIndex) => (
                    <tr key={row.feature} className="pricing-compare-row">
                      <th scope="row" className="pricing-compare-sticky">
                        <span className="pricing-compare-feature">{row.feature}</span>
                        <span className="pricing-compare-detail">{row.detail}</span>
                      </th>
                      {plans.map((plan) => (
                        <td
                          key={plan.id}
                          ref={
                            groupIndex === 0 && rowIndex === 0
                              ? (node) => {
                                  columnRefs.current[plan.id] = node;
                                }
                              : undefined
                          }
                          className={cn("pricing-compare-cell")}
                          data-tier={tierDataAttr(plan.id)}
                          data-selected={plan.id === selectedTier || undefined}
                        >
                          <ValueCell value={row.values[plan.id as TierId]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
