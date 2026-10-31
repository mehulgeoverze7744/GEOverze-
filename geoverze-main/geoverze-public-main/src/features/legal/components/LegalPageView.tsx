import { Link } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader, SectionContainer } from "@/components/shared";

import { legalConfig, legalRoutes, type LegalRoute } from "../legal-config";
import type { LegalSection } from "../types";
import { InfoPageShell } from "./InfoPageShell";

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
    <InfoPageShell>
      <PageShell>
        <PageHeader
          eyebrow="Legal"
          title={title}
          description={description}
          breadcrumb={[{ label: "Home", to: "/" }, { label: title }]}
        />

        <section className="pb-[var(--space-section-sm)]">
          <SectionContainer size="narrow">
            <div className="gvrze-info-doc">
              <p className="gvrze-info-doc__meta">Last updated {legalConfig.lastUpdated}</p>
              <p className="gvrze-info-doc__lede mt-4">
                This is a working draft for review. It describes the service as built today. Anything
                marked as not yet confirmed is not a promise, a fee, or a delivery commitment.
                Mandatory rights under applicable law are not removed by this page.
              </p>
              <p className="gvrze-info-doc__lede mt-4">{entityLine()}</p>

              <nav aria-label="On this page" className="mt-8 border-t pt-6">
                <p className="gvrze-info-doc__meta">On this page</p>
                <ol className="mt-4 space-y-2">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`}>
                        {index + 1}. {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <article className="mt-10 space-y-2">
                {sections.map((section, index) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28">
                    <h2>
                      {index + 1}. {section.title}
                    </h2>
                    <div className="mt-4 space-y-4">
                      {section.blocks.map((block, blockIndex) =>
                        block.kind === "list" ? (
                          <ul key={blockIndex} className="list-disc space-y-2 pl-5">
                            {block.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p key={blockIndex}>{block.text}</p>
                        ),
                      )}
                    </div>
                  </section>
                ))}
              </article>

              <section className="gvrze-info-related mt-12 border-t pt-8">
                <h2>Related</h2>
                <ul className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <li>
                    <Link to="/">Back to GVRZE</Link>
                  </li>
                  {related.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to}>{item.label}</Link>
                    </li>
                  ))}
                  <li>
                    <a href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a>
                  </li>
                </ul>
              </section>
            </div>
          </SectionContainer>
        </section>
      </PageShell>
    </InfoPageShell>
  );
}
