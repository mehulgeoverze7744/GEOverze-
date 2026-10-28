import { createFileRoute } from "@tanstack/react-router";

import { LegalPageView } from "@/features/legal/components/LegalPageView";
import { refundSections } from "@/features/legal/content/refund";
import { legalHead } from "@/features/legal/legal-head";

const title = "Refund and Replacement Policy";
const description =
  "Change-of-mind returns are not accepted. Defective, damaged, or incorrect GEOstore products can be replaced or refunded subject to applicable law.";

export const Route = createFileRoute("/refund-policy")({
  head: () => legalHead(title, description, "/refund-policy"),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <LegalPageView
      path="/refund-policy"
      title={title}
      description="No refund for a change of mind. A verified defective, damaged, or incorrect product can be replaced or refunded, subject to applicable law."
      sections={refundSections}
    />
  );
}
