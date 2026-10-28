import { createFileRoute } from "@tanstack/react-router";

import { LegalPageView } from "@/features/legal/components/LegalPageView";
import { disclaimerSections } from "@/features/legal/content/disclaimer";
import { legalHead } from "@/features/legal/legal-head";

const title = "Disclaimer";
const description =
  "GVRZE content is for general geography learning. Scores, availability, merchandise images, and rewards have limits, subject to applicable law.";

export const Route = createFileRoute("/disclaimer")({
  head: () => legalHead(title, description, "/disclaimer"),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <LegalPageView
      path="/disclaimer"
      title={title}
      description="Educational content, scores, availability, product images, and rewards — and the limits around each."
      sections={disclaimerSections}
    />
  );
}
