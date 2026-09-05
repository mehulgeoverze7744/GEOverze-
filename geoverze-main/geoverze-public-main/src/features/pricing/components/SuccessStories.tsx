import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Globe, TrendingUp, Users } from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { cn } from "@/lib/utils";

import { testimonials, type Testimonial } from "../data/testimonials";
import { PricingSectionHeader } from "./PricingSectionHeader";
import "../styles/pricing-editorial.css";

const PROOF_COLUMNS = [
  {
    icon: Users,
    title: "Creators educate",
    subtitle: "Real impact awaits",
  },
  {
    icon: Globe,
    title: "Explorers learn",
    subtitle: "Curiosity has no borders",
  },
  {
    icon: TrendingUp,
    title: "Members grow",
    subtitle: "A brighter, more aware world",
  },
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function formatMeta(plan: string, stat: string) {
  return `${plan.toUpperCase()} · ${stat.toUpperCase()}`;
}

function StoryCard({
  testimonial,
  index,
  active,
  onSelect,
}: {
  testimonial: Testimonial;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <figure
      className={cn("pricing-story-card", active && "pricing-story-card--active")}
      data-active={active}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={onSelect}
      tabIndex={0}
      role="group"
      aria-roledescription="testimonial"
      aria-label={`Testimonial ${number} from ${testimonial.name}`}
    >
      <span className="pricing-story-mark" aria-hidden="true">
        &ldquo;
      </span>
      <blockquote className="pricing-story-quote">{testimonial.quote}</blockquote>
      <div className="pricing-story-divider" aria-hidden="true" />
      <figcaption className="pricing-story-footer">
        <span className="pricing-story-avatar" aria-hidden="true">
          {initials(testimonial.name)}
        </span>
        <span className="pricing-story-meta-block">
          <span className="pricing-story-name">{testimonial.name}</span>
          <span className="pricing-story-role">{testimonial.role}</span>
          <span className="pricing-story-achievement">
            {formatMeta(testimonial.plan, testimonial.stat)}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Editorial success stories — illustrative placeholders. */
export function SuccessStories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    const total = testimonials.length;
    setActiveIndex(((index % total) + total) % total);
  }, []);

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[activeIndex] as HTMLElement | undefined;
    if (!card || !track) return;

    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  return (
    <section aria-labelledby="stories-heading" className="pricing-stories-section">
      <SectionContainer size="wide" className="pricing-stories-inner">
        <PricingSectionHeader
          id="stories-heading"
          eyebrow="Success stories"
          title="Illustrative, for now"
          description="Placeholder voices from a creator, an explorer and a premium member — replaced with real ones after launch."
        />

        <AnimatedSection>
          <div
            className="pricing-stories-showcase"
            role="region"
            aria-roledescription="carousel"
            aria-label="Member success stories"
          >
            <div ref={trackRef} className="pricing-stories-track">
              {testimonials.map((testimonial, index) => (
                <StoryCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  index={index}
                  active={index === activeIndex}
                  onSelect={() => setActiveIndex(index)}
                />
              ))}
            </div>

            <div className="pricing-stories-controls">
              <button
                type="button"
                className="pricing-stories-nav"
                onClick={goPrev}
                aria-label="Previous testimonial"
              >
                <ChevronLeft strokeWidth={1.6} aria-hidden="true" />
              </button>

              <div className="pricing-stories-progress" role="tablist" aria-label="Testimonials">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={testimonial.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`Show testimonial from ${testimonial.name}`}
                    className={cn(
                      "pricing-stories-progress-bar",
                      index === activeIndex && "pricing-stories-progress-bar--active",
                    )}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>

              <button
                type="button"
                className="pricing-stories-nav"
                onClick={goNext}
                aria-label="Next testimonial"
              >
                <ChevronRight strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="pricing-stories-proof" aria-hidden="true">
            {PROOF_COLUMNS.map((column, index) => {
              const Icon = column.icon;
              return (
                <div key={column.title} className="pricing-stories-proof-col">
                  <Icon className="pricing-stories-proof-icon" strokeWidth={1.5} />
                  <p className="pricing-stories-proof-title">{column.title}</p>
                  <p className="pricing-stories-proof-subtitle">{column.subtitle}</p>
                  {index < PROOF_COLUMNS.length - 1 ? (
                    <span className="pricing-stories-proof-divider" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
}
