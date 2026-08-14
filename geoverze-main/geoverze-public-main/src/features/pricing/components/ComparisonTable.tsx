import { Check, Minus } from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";

import { comparisonGroups, type ComparisonValue } from "../data/comparison";
import { pricingPlans, type TierId } from "../data/plans";

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
  return <span className="text-sm text-foreground/70">{value}</span>;
}

/** Desktop table + mobile per-plan stacks. */
export function ComparisonTable({ heading = true }: { heading?: boolean }) {
  return (
    <section aria-labelledby="compare-heading" className="pb-[var(--space-section-sm)]">
      <SectionContainer size="wide">
        {heading ? (
          <SectionHeading
            eyebrow="Compare"
            title="What each membership includes"
            description="Every capability across the platform, plan by plan."
            className="mb-12"
          />
        ) : (
          <h2 id="compare-heading" className="sr-only">
            Plan comparison
          </h2>
        )}

        {/* Desktop */}
        <GlassCard strong className="hidden overflow-hidden p-0 lg:block">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">GEOverze membership feature comparison</caption>
            <thead>
              <tr className="border-b border-bronze/15">
                <th
                  scope="col"
                  className="w-[38%] px-8 py-6 text-[0.62rem] uppercase tracking-[0.28em] text-foreground/50"
                >
                  Feature
                </th>
                {pricingPlans.map((plan) => (
                  <th
                    key={plan.id}
                    scope="col"
                    className={cn(
                      "px-6 py-6 text-center text-[0.66rem] uppercase tracking-[0.28em]",
                      plan.featured ? "text-bronze-glow" : "text-foreground/55",
                    )}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            {comparisonGroups.map((group) => (
              <tbody key={group.title}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={pricingPlans.length + 1}
                    className="bg-bronze/[0.04] px-8 py-3 text-left text-[0.6rem] uppercase tracking-[0.3em] text-bronze"
                  >
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.feature} className="border-t border-bronze/10">
                    <th scope="row" className="px-8 py-5 align-top font-normal">
                      <span className="block text-sm text-foreground/85">{row.feature}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-foreground/50">
                        {row.detail}
                      </span>
                    </th>
                    {pricingPlans.map((plan) => (
                      <td
                        key={plan.id}
                        className={cn(
                          "px-6 py-5 text-center align-middle",
                          plan.featured && "bg-bronze/[0.03]",
                        )}
                      >
                        <ValueCell value={row.values[plan.id as TierId]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </GlassCard>

        {/* Tablet & mobile */}
        <div className="grid gap-5 lg:hidden">
          {pricingPlans.map((plan, i) => (
            <AnimatedSection key={plan.id} delay={i * 80}>
              <GlassCard strong={plan.featured} className="p-7">
                <p className="text-[0.66rem] uppercase tracking-[0.3em] text-bronze">{plan.name}</p>
                <dl className="mt-6 space-y-4">
                  {comparisonGroups.flatMap((group) =>
                    group.rows.map((row) => (
                      <div
                        key={`${plan.id}-${row.feature}`}
                        className="flex items-start justify-between gap-6 border-t border-bronze/10 pt-4 first:border-0 first:pt-0"
                      >
                        <dt className="text-sm text-foreground/60">{row.feature}</dt>
                        <dd className="shrink-0 text-right">
                          <ValueCell value={row.values[plan.id as TierId]} />
                        </dd>
                      </div>
                    )),
                  )}
                </dl>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
