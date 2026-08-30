import { Link } from "@tanstack/react-router";
import { Coins, CreditCard, Eye, History, Sparkles, Target } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TimelineItem } from "@/components/shared/TimelineItem";
import {
  FAVORITE_CATEGORIES,
  LEARNING_PROGRESS,
  QUIZ_HISTORY,
  RECENTLY_VIEWED,
  RECOMMENDED_QUIZZES,
  SAVED_ARTICLES,
  SUBSCRIPTION,
  UPCOMING_EVENTS,
} from "@/features/dashboard/data/dashboard";
import { useCreditHistory } from "@/features/progression/hooks/useCreditHistory";
import { useProgressionStore } from "@/stores/progressionStore";

/** Small titled panel used by every dashboard widget. */
function Widget({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  icon: typeof Target;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={className ? `p-6 ${className}` : "p-6"}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2.5 text-[0.68rem] uppercase tracking-[0.26em] text-foreground/50">
          <Icon className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
          {title}
        </h3>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </GlassCard>
  );
}

function Bar({ value, label, detail }: { value: number; label: string; detail: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-xs">
        <span className="text-foreground/70">{label}</span>
        <span className="text-foreground/50">{detail}</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-bronze/10"
        role="img"
        aria-label={`${label}: ${value}% complete`}
      >
        <span
          className="block h-full rounded-full bg-gradient-bronze"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/** The dashboard widget mosaic: progress, history, recommendations and account. */
export function DashboardWidgets() {
  const walletBalance = useProgressionStore((s) => s.player.credits);
  const { monthlyEarned } = useCreditHistory();

  return (
    <SectionContainer className="mt-[var(--space-section-sm)]">
      <AnimatedSection>
        <SectionHeading
          eyebrow="Your world"
          title="Progress, history and what's next"
          description="Placeholder figures for now — these widgets bind to the quiz engine once it ships."
        />
      </AnimatedSection>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <AnimatedSection className="lg:col-span-2">
          <Widget title="Learning progress" icon={Target}>
            <div className="space-y-5">
              {LEARNING_PROGRESS.map((track) => (
                <Bar key={track.id} value={track.value} label={track.label} detail={track.detail} />
              ))}
            </div>
          </Widget>
        </AnimatedSection>

        <AnimatedSection delay={60}>
          <Widget title="Favourite categories" icon={Sparkles}>
            <ul className="space-y-4">
              {FAVORITE_CATEGORIES.map((category) => (
                <li key={category.id} className="flex items-center gap-3">
                  <category.icon
                    className="h-3.5 w-3.5 shrink-0 text-bronze/90"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-xs text-foreground/70">{category.label}</span>
                  <span className="text-xs text-gradient-bronze">{category.share}%</span>
                </li>
              ))}
            </ul>
          </Widget>
        </AnimatedSection>

        <AnimatedSection delay={120}>
          <Widget
            title="Recent quizzes"
            icon={History}
            action={
              <Link
                to="/play"
                className="text-[0.62rem] uppercase tracking-[0.2em] text-bronze/90 hover:text-bronze"
              >
                All
              </Link>
            }
          >
            <ol className="list-none">
              {QUIZ_HISTORY.map((entry, index) => (
                <TimelineItem
                  key={entry.id}
                  icon={entry.icon}
                  title={entry.title}
                  meta={entry.when}
                  last={index === QUIZ_HISTORY.length - 1}
                >
                  {entry.score} / {entry.total} correct
                </TimelineItem>
              ))}
            </ol>
          </Widget>
        </AnimatedSection>

        <AnimatedSection delay={180} className="lg:col-span-2">
          <Widget title="Recommended for you" icon={Sparkles}>
            <ul className="grid gap-3 sm:grid-cols-3">
              {RECOMMENDED_QUIZZES.map((item) => (
                <li key={item.id}>
                  <Link
                    to="/play"
                    className="group flex h-full flex-col rounded-xl border border-bronze/12 bg-charcoal/40 p-4 transition-colors motion-base hover:border-bronze/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
                  >
                    <item.icon
                      className="h-4 w-4 text-bronze/90"
                      strokeWidth={1.4}
                      aria-hidden="true"
                    />
                    <p className="mt-4 text-sm text-foreground/85">{item.title}</p>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-foreground/50">
                      {item.reason}
                    </p>
                    <p className="mt-4 text-[0.6rem] uppercase tracking-[0.2em] text-bronze/90">
                      {item.level}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Widget>
        </AnimatedSection>

        <AnimatedSection delay={240}>
          <Widget title="Recently viewed" icon={Eye}>
            <ul className="space-y-3">
              {RECENTLY_VIEWED.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    className="block rounded-lg px-1 py-1 text-xs text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
                  >
                    {item.title}
                    <span className="mt-1 block text-[0.65rem] text-foreground/50">
                      {item.meta}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Widget>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <Widget
            title="Saved articles"
            icon={Eye}
            action={
              <Link
                to="/bookmarks"
                className="text-[0.62rem] uppercase tracking-[0.2em] text-bronze/90 hover:text-bronze"
              >
                All
              </Link>
            }
          >
            <ul className="space-y-3">
              {SAVED_ARTICLES.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    className="block rounded-lg px-1 py-1 text-xs text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
                  >
                    {item.title}
                    <span className="mt-1 block text-[0.65rem] text-foreground/50">
                      {item.meta}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Widget>
        </AnimatedSection>

        <AnimatedSection delay={360}>
          <Widget title="GEO credits" icon={Coins}>
            <p className="text-[clamp(1.8rem,3vw,2.4rem)] font-light leading-none text-gradient-bronze">
              <AnimatedCounter value={walletBalance} />
            </p>
            <p className="mt-4 text-xs text-foreground/50">Available balance</p>
            <p className="mt-1 text-xs text-foreground/50">
              +{monthlyEarned} earned this month from gameplay
            </p>
          </Widget>
        </AnimatedSection>

        <AnimatedSection delay={420}>
          <Widget title="Subscription" icon={CreditCard}>
            <p className="text-lg font-light text-foreground/85">{SUBSCRIPTION.plan}</p>
            <p className="mt-1 text-xs text-bronze/90">{SUBSCRIPTION.status}</p>
            <ul className="mt-5 space-y-2">
              {SUBSCRIPTION.perks.map((perk) => (
                <li key={perk} className="text-xs text-foreground/50">
                  {perk}
                </li>
              ))}
            </ul>
            <GeoButton asChild variant="secondary" className="mt-6 w-full">
              <Link to="/pricing">Compare plans</Link>
            </GeoButton>
          </Widget>
        </AnimatedSection>

        <AnimatedSection delay={480}>
          <Widget title="Upcoming" icon={Sparkles}>
            <ol className="list-none">
              {UPCOMING_EVENTS.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  icon={event.icon}
                  title={event.title}
                  meta={event.when}
                  last={index === UPCOMING_EVENTS.length - 1}
                >
                  {event.description}
                </TimelineItem>
              ))}
            </ol>
          </Widget>
        </AnimatedSection>
      </div>
    </SectionContainer>
  );
}
