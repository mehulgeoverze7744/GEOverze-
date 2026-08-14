import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GlassCard, PageHeader, SectionContainer } from "@/components/shared";
import { LegalDocument } from "@/features/legal/components/LegalDocument";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — GEOverze" },
      {
        name: "description",
        content:
          "How GEOverze handles personal data, cookies, retention and privacy requests while the platform is in development.",
      },
      { property: "og:title", content: "Privacy Policy — GEOverze" },
      {
        property: "og:description",
        content: "How GEOverze handles personal data, cookies and privacy requests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/privacy" }],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "About this page",
    body: [
      "This page is maintained by the GEOverze team to answer common privacy questions about GEOverze. It is app-owned editable content, not an independent audit or certification.",
      "GEOverze is currently in development. The platform does not yet operate user accounts, payments or gameplay data collection.",
    ],
  },
  {
    title: "What we collect today",
    body: [
      "The current site is a public, informational experience. It does not create accounts, store profiles or process payments.",
      "Forms shown on this site are presentational and do not transmit submissions to a backend.",
    ],
  },
  {
    title: "What we will collect",
    body: [
      "When accounts launch, we expect to process an email address, a display name and gameplay results needed to run rounds, rankings and rewards.",
      "This page will be updated with the specifics before any of that data collection begins.",
    ],
  },
  {
    title: "Cookies and analytics",
    body: [
      "Any cookies or analytics used in future phases will be described here, along with how to opt out where applicable.",
    ],
  },
  {
    title: "Retention and deletion",
    body: [
      "Retention periods and deletion routes will be documented once accounts exist. Until then there is no user data to retain or delete.",
    ],
  },
  {
    title: "Privacy requests and contact",
    body: [
      "For privacy questions, reach the team through the contact page. We will respond with the detail available at the current stage of development.",
    ],
  },
];

function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="Written plainly, and kept honest about what GEOverze does and does not do today."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Privacy Policy" }]}
      />

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="narrow">
          <AnimatedSection>
            <GlassCard strong className="p-8 md:p-12">
              <LegalDocument sections={sections} />
            </GlassCard>
          </AnimatedSection>
        </SectionContainer>
      </section>
    </PageShell>
  );
}
