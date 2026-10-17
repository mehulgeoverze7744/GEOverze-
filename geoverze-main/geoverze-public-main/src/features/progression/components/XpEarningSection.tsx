import { AnimatedSection, SectionContainer, SectionHeading } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { XP_RULES } from "../data/xpRules";

/** Display-only XP earning table shared by Credit History. */
export function XpEarningSection({ className }: { className?: string }) {
  return (
    <SectionContainer className={className}>
      <AnimatedSection>
        <SectionHeading
          eyebrow="Experience"
          title="How XP is earned"
          description="The full earning table, exactly as the engine will award it."
        />
      </AnimatedSection>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {XP_RULES.map((rule, index) => (
          <AnimatedSection key={rule.id} delay={index * 40}>
            <GameCard interactive={false} className="h-full p-5">
              <rule.icon className="h-4 w-4 text-bronze/90" strokeWidth={1.9} aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold text-foreground">{rule.label}</p>
              <p className="mt-1 text-base font-semibold text-bronze-glow">{rule.amount}</p>
              <p className="mt-2 text-xs leading-relaxed text-foreground/50">{rule.description}</p>
            </GameCard>
          </AnimatedSection>
        ))}
      </div>
    </SectionContainer>
  );
}
