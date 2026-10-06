import { PageShell } from "@/components/layout/PageShell";
import { SectionContainer } from "@/components/shared/SectionContainer";

import { SupportContent } from "./SupportContent";

/** Standalone Support shell — kept for the /support redirect target fallback. */
export function SupportPage() {
  return (
    <PageShell>
      <SectionContainer size="default" className="mx-auto max-w-[57.5rem]">
        <SupportContent />
      </SectionContainer>
    </PageShell>
  );
}
