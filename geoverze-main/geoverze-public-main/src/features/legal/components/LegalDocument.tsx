/** Renders a legal document as plain, framework-rendered text sections. */
export function LegalDocument({
  sections,
  updated,
}: {
  sections: { title: string; body: string[] }[];
  updated?: string;
}) {
  return (
    <article className="space-y-10">
      {updated ? (
        <p className="text-[0.62rem] uppercase tracking-[0.28em] text-foreground/50">
          Last updated {updated}
        </p>
      ) : null}
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-base font-medium tracking-tight text-bronze">{section.title}</h2>
          <div className="mt-4 space-y-4">
            {section.body.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/60">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
