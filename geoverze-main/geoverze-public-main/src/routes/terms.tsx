import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GlassCard, PageHeader, SectionContainer } from "@/components/shared";
import { LegalDocument } from "@/features/legal/components/LegalDocument";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — GEOverze" },
      {
        name: "description",
        content:
          "The terms that govern use of the GEOverze site and platform, including acceptable use and content ownership.",
      },
      { property: "og:title", content: "Terms & Conditions — GEOverze" },
      {
        property: "og:description",
        content: "Terms governing use of the GEOverze site and platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/terms" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/terms" }],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "About these terms",
    body: [
      "These terms are maintained by the GEOverze team and describe how the GEOverze site may be used. They will be expanded as platform features launch.",
      "GEOverze is in development. Nothing on this site is a live purchase, subscription or account service today.",
    ],
  },
  {
    title: "Using the site",
    body: [
      "You may browse and share the site freely. You may not attempt to disrupt it, probe it for vulnerabilities without permission, or scrape it at a scale that degrades service for others.",
    ],
  },
  {
    title: "Accounts",
    body: [
      "When accounts launch, you will be responsible for the accuracy of your registration details and for keeping your credentials secure.",
    ],
  },
  {
    title: "Content and ownership",
    body: [
      "The GEOverze name, visual identity, 3D assets, copy and reference structure are owned by GEOverze. Geographic facts themselves are not claimed as proprietary.",
    ],
  },
  {
    title: "Purchases and credits",
    body: [
      "Pricing shown on this site is indicative. No billing is active, and no purchase obligations exist until the payments module launches with its own terms.",
    ],
  },
  {
    title: "Changes",
    body: [
      "These terms will change as the platform grows. Material changes will be reflected on this page.",
    ],
  },
  {
    title: "Contact",
    body: ["Questions about these terms can be sent through the contact page."],
  },
];

function TermsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        description="Straightforward rules for using GEOverze while the platform is being built."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Terms & Conditions" }]}
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
