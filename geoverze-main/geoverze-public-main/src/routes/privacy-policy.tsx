import { createFileRoute } from "@tanstack/react-router";

import { LegalPageView } from "@/features/legal/components/LegalPageView";
import { privacySections } from "@/features/legal/content/privacy";
import { legalHead } from "@/features/legal/legal-head";

const title = "Privacy Policy";
const description =
  "How GVRZE handles account, quiz, library, community, and store information, including what is not collected today.";

export const Route = createFileRoute("/privacy-policy")({
  head: () => legalHead(title, description, "/privacy-policy"),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <LegalPageView
      path="/privacy-policy"
      title={title}
      description="How information is handled for visitors, accounts, quizzes, the library, community, and the store."
      sections={privacySections}
    />
  );
}
