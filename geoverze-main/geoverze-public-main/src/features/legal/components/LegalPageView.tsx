import { Link } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { GlassCard, PageHeader, SectionContainer } from "@/components/shared";

import { legalConfig, legalRoutes, type LegalRoute } from "../legal-config";
import type { LegalSection } from "../types";

function entityLine() {
  if (legalConfig.entityName && legalConfig.address) {
    return `${legalConfig.entityName}, ${legalConfig.address}.`;
  }
  if (legalConfig.entityName) {
    return `${legalConfig.entityName}. A business address has not been confirmed for publication.`;
  }
  return "A registered company name and business address have not been confirmed for publication. Until they are, “GVRZE” means the operator of this service.";
}

export function LegalPageView({
  path,
  title,
  description,
  sections,
}: {
  path: LegalRoute;
  title: string;
  description: string;
  sections: LegalSection[];
}) {
  const related = legalRoutes.filter((item) => item.to !== path);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Legal"
        title={title}
        description={description}
        breadcrumb={[{ label: "Home", to: "/" }, { label: title }]}
      />

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="narrow">
          <GlassCard strong className="p-6 sm:p-8 md:p-12">
            <p className="text-[0.62rem] uppercase tracking-[0.28em] text-foreground/50">
              Last updated {legalConfig.lastUpdated}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/60">
              This is a working draft for review. It describes the service as built today. Anything
              marked as not yet confirmed is not a promise, a fee, or a delivery commitment.
              Mandatory rights under applicable law are not removed by this page.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/60">{entityLine()}</p>

            <nav aria-label="On this page" className="mt-8 border-t border-bronze/15 pt-6">
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-bronze/90">
                On this page
              </p>
              <ol className="mt-4 space-y-2">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-foreground/70 transition-colors hover:text-bronze"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <article className="mt-10 space-y-10">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="text-base font-medium tracking-tight text-bronze">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.blocks.map((block, index) =>
                      block.kind === "list" ? (
                        <ul
                          key={index}
                          className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/60"
                        >
                          {block.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p key={index} className="text-sm leading-relaxed text-foreground/60">
                          {block.text}
                        </p>
                      ),
                    )}
                  </div>
                </section>
              ))}
            </article>

            <section className="mt-12 border-t border-bronze/15 pt-8">
              <h2 className="text-base font-medium tracking-tight text-bronze">Related</h2>
              <ul className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <li>
                  <Link to="/" className="text-sm text-foreground/70 hover:text-bronze">
                    Back to GVRZE
                  </Link>
                </li>
                {related.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-sm text-foreground/70 hover:text-bronze">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${legalConfig.supportEmail}`}
                    className="text-sm text-foreground/70 hover:text-bronze"
                  >
                    {legalConfig.supportEmail}
                  </a>
                </li>
              </ul>
            </section>
          </GlassCard>
        </SectionContainer>
      </section>
    </PageShell>
  );
}
