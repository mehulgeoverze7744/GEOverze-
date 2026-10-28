import { createFileRoute } from "@tanstack/react-router";

import { LegalPageView } from "@/features/legal/components/LegalPageView";
import { termsSections } from "@/features/legal/content/terms";
import { legalHead } from "@/features/legal/legal-head";

const title = "Terms of Service";
const description =
  "Draft terms for using GVRZE, including accounts, quizzes, credits, the store, and the plans that are not yet billable.";

export const Route = createFileRoute("/terms-of-service")({
  head: () => legalHead(title, description, "/terms-of-service"),
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <LegalPageView
      path="/terms-of-service"
      title={title}
      description="The draft rules for accounts, play, the library, community, credits, memberships, and the store."
      sections={termsSections}
    />
  );
}
