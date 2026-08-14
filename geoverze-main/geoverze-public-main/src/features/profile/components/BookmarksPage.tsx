import { useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedBadge } from "@/components/shared/AnimatedBadge";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EmptyState } from "@/components/shared/EmptyState";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { BOOKMARK_SECTIONS } from "@/features/profile/data/bookmarks";
import { cn } from "@/lib/utils";

/** Saved articles, quizzes, maps and learning paths. */
export function BookmarksPage() {
  const [activeId, setActiveId] = useState(BOOKMARK_SECTIONS[0]!.id);
  const active =
    BOOKMARK_SECTIONS.find((section) => section.id === activeId) ?? BOOKMARK_SECTIONS[0]!;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Bookmarks"
        title="Your saved collection"
        description="Anything you bookmark across GEOverze gathers here, grouped by where it came from."
      />
      <SectionContainer>
        <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Bookmark categories">
          {BOOKMARK_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              role="tab"
              id={`bookmark-tab-${section.id}`}
              aria-selected={section.id === activeId}
              aria-controls={`bookmark-panel-${section.id}`}
              onClick={() => setActiveId(section.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45",
                section.id === activeId
                  ? "border-bronze/55 bg-bronze/12 text-foreground"
                  : "border-bronze/15 text-foreground/50 hover:border-bronze/35 hover:text-foreground/80",
              )}
            >
              <section.icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              {section.label}
              <span className="text-bronze/90">{section.items.length}</span>
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`bookmark-panel-${active.id}`}
          aria-labelledby={`bookmark-tab-${active.id}`}
          className="mt-8"
        >
          {active.items.length === 0 ? (
            <AnimatedSection>
              <EmptyState
                icon={active.icon}
                title={active.emptyTitle}
                description={active.emptyBody}
              />
            </AnimatedSection>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.items.map((item, index) => (
                <li key={item.id}>
                  <AnimatedSection delay={index * 60}>
                    <GlassCard className="flex h-full flex-col p-6">
                      <AnimatedBadge>{item.tag}</AnimatedBadge>
                      <h2 className="mt-5 text-sm text-foreground/85">{item.title}</h2>
                      <p className="mt-2 flex-1 text-xs leading-relaxed text-foreground/50">
                        {item.description}
                      </p>
                      <p className="mt-5 text-[0.62rem] uppercase tracking-[0.2em] text-foreground/50">
                        {item.meta}
                      </p>
                    </GlassCard>
                  </AnimatedSection>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionContainer>
    </PageShell>
  );
}
