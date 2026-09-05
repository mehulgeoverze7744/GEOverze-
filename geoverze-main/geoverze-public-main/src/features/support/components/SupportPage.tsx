import { Link } from "@tanstack/react-router";
import { MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { SectionContainer } from "@/components/shared/SectionContainer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  supportCategoryById,
  supportContact,
  supportFaqs,
  supportGroups,
} from "@/features/support/data/support";

import { SupportGroup, SupportRow } from "./SupportRow";
import "../styles/support.css";

/** Help centre — grouped categories, searchable FAQ and contact. */
export function SupportPage() {
  const [query, setQuery] = useState("");

  const faqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return supportFaqs;
    return supportFaqs.filter(
      (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <PageShell>
      <SectionContainer size="default" className="support-page mx-auto max-w-[57.5rem]">
        <header className="support-header">
          <AnimatedSection>
            <p className="support-eyebrow">Support</p>
            <h1 className="support-title">Need a hand?</h1>
            <p className="support-description">
              Find answers, understand how GEOverze works, and get back to exploring.
            </p>
          </AnimatedSection>
        </header>

        <AnimatedSection>
          <div className="support-search-wrap">
            <Search
              className="support-search-icon h-4 w-4"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <input
              id="support-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search support"
              aria-label="Search support"
              className="support-search"
            />
          </div>
        </AnimatedSection>

        <AnimatedSection className="support-groups">
          {supportGroups.map((group) => (
            <SupportGroup key={group.label} label={group.label}>
              {group.categoryIds.map((categoryId) => {
                const category = supportCategoryById(categoryId);
                if (!category) return null;
                return (
                  <SupportRow
                    key={category.id}
                    icon={category.icon}
                    title={category.title}
                    subtitle={category.description}
                    to={category.to}
                  />
                );
              })}
            </SupportGroup>
          ))}

          <SupportGroup label="Get more help">
            <SupportRow
              icon={supportContact.icon}
              title={supportContact.title}
              subtitle={supportContact.description}
              to={supportContact.to}
            />
          </SupportGroup>
        </AnimatedSection>

        <section className="support-faq" aria-labelledby="support-faq-heading">
          <AnimatedSection>
            <p className="support-faq-label">Common questions</p>
            <h2 id="support-faq-heading" className="support-faq-title">
              Answers to what people ask first
            </h2>

            <div className="support-faq-list">
              {faqs.length === 0 ? (
                <div className="support-empty">
                  <p className="support-empty-title">No answers match that search</p>
                  <p className="support-empty-body">
                    Try a shorter phrase, or ask us directly — we answer every message.
                  </p>
                  <GeoButton asChild variant="primary" size="sm" className="mt-4">
                    <Link to="/contact">Ask a question</Link>
                  </GeoButton>
                </div>
              ) : (
                <Accordion type="single" collapsible>
                  {faqs.map((item) => (
                    <AccordionItem
                      key={item.question}
                      value={item.question}
                      className="support-faq-item border-none px-5"
                    >
                      <AccordionTrigger className="gap-3 py-4 text-left text-sm font-medium text-foreground/88 hover:no-underline [&>svg]:shrink-0">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-sm leading-relaxed text-foreground/50 [overflow-wrap:anywhere]">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </AnimatedSection>
        </section>
      </SectionContainer>
    </PageShell>
  );
}
