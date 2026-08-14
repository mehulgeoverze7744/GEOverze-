import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, SectionContainer } from "@/components/shared";
import { CollectionCard } from "../components/CollectionCard";
import { COLLECTIONS } from "../data/collections";

/** /play/collections — curated multi-quiz sets. */
export function CollectionsPage() {
  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <p className="eyebrow">Collections</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Play a whole route, not a single set
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            Collections chain several quizzes into one arc, ordered the way a cartographer would
            teach them.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.map((collection) => (
              <CollectionCard key={collection.slug} collection={collection} />
            ))}
          </div>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
