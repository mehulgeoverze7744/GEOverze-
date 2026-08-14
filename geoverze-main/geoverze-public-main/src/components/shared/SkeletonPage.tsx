import { PageShell } from "@/components/layout/PageShell";
import { SectionContainer } from "./SectionContainer";
import { SkeletonBlock } from "./SkeletonBlock";

/**
 * Route-level loading state for the account area.
 * Mirrors the real page rhythm — header block, stat row, content grid — so a
 * pending navigation never shows a blank canvas.
 */
export function SkeletonPage({ stats = 4, cards = 6 }: { stats?: number; cards?: number }) {
  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <div
          className="rounded-3xl border border-bronze/12 bg-charcoal/40 p-7 sm:p-9"
          role="status"
          aria-label="Loading"
        >
          <SkeletonBlock variant="text" count={3} />
        </div>
      </SectionContainer>
      <SectionContainer className="mt-[var(--space-section-sm)] space-y-8">
        <SkeletonBlock variant="grid" count={stats} />
        <SkeletonBlock variant="grid" count={cards} />
      </SectionContainer>
    </PageShell>
  );
}
