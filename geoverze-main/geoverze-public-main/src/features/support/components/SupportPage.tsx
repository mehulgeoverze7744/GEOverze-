import { Link } from "@tanstack/react-router";
import { MessageCircle, Send } from "lucide-react";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedBadge } from "@/components/shared/AnimatedBadge";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EmptyState } from "@/components/shared/EmptyState";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { SectionContainer } from "@/components/shared/SectionContainer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supportCategories, supportFaqs } from "@/features/support/data/support";

/** Help centre: categories, searchable FAQ and a route to a human. */
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
      <PageHeader
        eyebrow="Support"
        title="Help, answers and a way through"
        description="Everything you need to understand how GEOverze works today and what's arriving next. If an answer isn't here, we'll get you one."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Support" }]}
      >
        <div className="max-w-xl">
          <SearchBar
            id="support-search"
            label="Search help articles"
            placeholder="Search help — accounts, plays, orders…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </PageHeader>

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer>
          <AnimatedSection>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {supportCategories.map((category) => (
                <GlassCard key={category.title} interactive className="p-7">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-bronze/25 bg-bronze/5 text-bronze">
                    <category.icon className="h-5 w-5" strokeWidth={1.3} />
                  </span>
                  <h2 className="mt-6 text-base font-light tracking-tight text-foreground">
                    {category.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/50">
                    {category.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </AnimatedSection>
        </SectionContainer>
      </section>

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="narrow">
          <AnimatedSection>
            <AnimatedBadge>Frequent questions</AnimatedBadge>
            <h2 className="mt-6 font-light leading-[1.1] tracking-tight text-foreground text-[clamp(1.5rem,3vw,2.2rem)]">
              Answers to what people ask first
            </h2>

            <div className="mt-10">
              {faqs.length === 0 ? (
                <EmptyState
                  icon={MessageCircle}
                  title="No answers match that search"
                  description="Try a shorter phrase, or ask us directly — we answer every message."
                  action={
                    <GeoButton asChild variant="primary">
                      <Link to="/contact">Ask a question</Link>
                    </GeoButton>
                  }
                />
              ) : (
                <Accordion type="single" collapsible className="space-y-3">
                  {faqs.map((item) => (
                    <AccordionItem
                      key={item.question}
                      value={item.question}
                      className="glass-panel overflow-hidden rounded-2xl border-bronze/15 px-6"
                    >
                      <AccordionTrigger className="gap-4 py-5 text-left text-sm font-light tracking-tight text-foreground/85 hover:no-underline [&>svg]:shrink-0">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 text-sm leading-relaxed text-foreground/50 [overflow-wrap:anywhere]">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </AnimatedSection>
        </SectionContainer>
      </section>

      <section className="pb-[var(--space-section)]">
        <SectionContainer>
          <AnimatedSection>
            <GlassCard
              strong
              className="grid gap-8 p-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-14"
            >
              <div className="min-w-0">
                <p className="eyebrow">Still stuck?</p>
                <h2 className="mt-5 font-light leading-[1.1] tracking-tight text-foreground text-[clamp(1.4rem,2.6vw,2rem)]">
                  Talk to the people building GEOverze
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/50">
                  Every message is read by the team. Tell us what you were doing and what you
                  expected — that's usually all we need.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <GeoButton asChild variant="primary" size="lg">
                  <Link to="/contact">
                    <Send className="h-4 w-4" strokeWidth={1.5} />
                    Contact us
                  </Link>
                </GeoButton>
                <GeoButton asChild variant="secondary" size="lg">
                  <Link to="/about">About GEOverze</Link>
                </GeoButton>
              </div>
            </GlassCard>
          </AnimatedSection>
        </SectionContainer>
      </section>
    </PageShell>
  );
}
