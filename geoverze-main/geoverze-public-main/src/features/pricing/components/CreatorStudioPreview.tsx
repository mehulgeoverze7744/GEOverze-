import type { ReactNode } from "react";
import {
  BarChart3,
  Coins,
  FileText,
  Images,
  LayoutDashboard,
  ListChecks,
  Send,
  Settings,
  Users,
} from "lucide-react";

import { BrandMark } from "@/components/shared/BrandMark";
import { cn } from "@/lib/utils";

import { REVIEW_QUEUE } from "@/features/studio/data/workspace";

export type CreatorPreviewView =
  | "dashboard"
  | "analytics"
  | "publishing"
  | "monetization"
  | "review";

const SIDEBAR = [
  { label: "Dashboard", icon: LayoutDashboard, activeOn: ["dashboard"] as CreatorPreviewView[] },
  { label: "My Quizzes", icon: ListChecks, activeOn: ["dashboard", "publishing"] as CreatorPreviewView[] },
  { label: "Articles", icon: FileText, activeOn: ["publishing"] as CreatorPreviewView[] },
  { label: "Media", icon: Images, activeOn: ["publishing"] as CreatorPreviewView[] },
  { label: "Analytics", icon: BarChart3, activeOn: ["analytics"] as CreatorPreviewView[] },
  { label: "Publishing", icon: Send, activeOn: ["publishing"] as CreatorPreviewView[] },
  { label: "Earnings", icon: Coins, activeOn: ["monetization"] as CreatorPreviewView[] },
  { label: "Settings", icon: Settings, activeOn: [] as CreatorPreviewView[] },
] as const;

const METRICS = [
  { value: "24", label: "Quizzes Published" },
  { value: "8.4K", label: "Total Plays" },
  { value: "74%", label: "Avg. Completion" },
  { value: "1.2K", label: "Followers" },
] as const;

const RECENT_QUIZZES = [
  { title: "Flags That Fool Everyone", meta: "12.4K plays · 78% completion", status: "Live" },
  { title: "Country Silhouettes", meta: "Submitted · Priority review", status: "Review" },
  { title: "Capital Cities Sprint", meta: "3.2K plays · 71% completion", status: "Live" },
] as const;

const CHART_BARS = [38, 52, 44, 61, 58, 72, 68, 84, 76, 88, 82, 91] as const;

type CreatorStudioPreviewProps = {
  view: CreatorPreviewView;
  className?: string;
};

/** Presentation-only Creator Studio product preview for the Pricing page. */
export function CreatorStudioPreview({ view, className }: CreatorStudioPreviewProps) {
  return (
    <div className={cn("pricing-creator-preview", className)} aria-hidden="true">
      <div className="pricing-creator-preview-frame">
        <aside className="pricing-creator-preview-sidebar">
          <div className="pricing-creator-preview-brand">
            <BrandMark className="pricing-creator-preview-mark" />
            <div>
              <p className="pricing-creator-preview-brand-eyebrow">GEOverze</p>
              <p className="pricing-creator-preview-brand-title">Creator Studio</p>
            </div>
          </div>
          <nav className="pricing-creator-preview-nav">
            {SIDEBAR.map((item) => {
              const active = item.activeOn.includes(view);
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  className={cn(
                    "pricing-creator-preview-nav-item",
                    active && "pricing-creator-preview-nav-item--active",
                  )}
                >
                  <Icon strokeWidth={1.7} aria-hidden="true" />
                  <span className="pricing-creator-preview-nav-label">{item.label}</span>
                </span>
              );
            })}
          </nav>
        </aside>

        <div className="pricing-creator-preview-main">
          <div className="pricing-creator-preview-views">
            <DashboardView active={view === "dashboard"} />
            <AnalyticsView active={view === "analytics"} />
            <PublishingView active={view === "publishing"} />
            <MonetizationView active={view === "monetization"} />
            <ReviewView active={view === "review"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({
  active,
  children,
  className,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pricing-creator-preview-panel",
        active && "pricing-creator-preview-panel--active",
        className,
      )}
    >
      {children}
    </div>
  );
}

function DashboardView({ active }: { active: boolean }) {
  return (
    <PreviewPanel active={active}>
      <header className="pricing-creator-preview-header">
        <h4 className="pricing-creator-preview-kicker">Welcome back, Creator</h4>
        <p className="pricing-creator-preview-sub">
          Create. Share. Inspire a more curious world.
        </p>
      </header>

      <div className="pricing-creator-preview-metrics">
        {METRICS.map((metric) => (
          <div key={metric.label} className="pricing-creator-preview-metric">
            <span className="pricing-creator-preview-metric-value">{metric.value}</span>
            <span className="pricing-creator-preview-metric-label">{metric.label}</span>
          </div>
        ))}
      </div>

      <section className="pricing-creator-preview-block">
        <h5 className="pricing-creator-preview-block-title">Recent Quizzes</h5>
        <ul className="pricing-creator-preview-rows">
          {RECENT_QUIZZES.map((quiz) => (
            <li key={quiz.title} className="pricing-creator-preview-row">
              <div>
                <p className="pricing-creator-preview-row-title">{quiz.title}</p>
                <p className="pricing-creator-preview-row-meta">{quiz.meta}</p>
              </div>
              <span className="pricing-creator-preview-row-badge">{quiz.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pricing-creator-preview-block">
        <h5 className="pricing-creator-preview-block-title">Performance</h5>
        <PerformanceChart />
      </section>
    </PreviewPanel>
  );
}

function AnalyticsView({ active }: { active: boolean }) {
  return (
    <PreviewPanel active={active}>
      <header className="pricing-creator-preview-header">
        <h4 className="pricing-creator-preview-kicker">Analytics</h4>
        <p className="pricing-creator-preview-sub">
          Plays, completion, accuracy and audience growth — per piece of content.
        </p>
      </header>

      <div className="pricing-creator-preview-metrics pricing-creator-preview-metrics--compact">
        <div className="pricing-creator-preview-metric">
          <span className="pricing-creator-preview-metric-value">8.4K</span>
          <span className="pricing-creator-preview-metric-label">Total Plays</span>
        </div>
        <div className="pricing-creator-preview-metric">
          <span className="pricing-creator-preview-metric-value">74%</span>
          <span className="pricing-creator-preview-metric-label">Avg. Completion</span>
        </div>
        <div className="pricing-creator-preview-metric">
          <span className="pricing-creator-preview-metric-value">+18%</span>
          <span className="pricing-creator-preview-metric-label">Week over Week</span>
        </div>
        <div className="pricing-creator-preview-metric">
          <span className="pricing-creator-preview-metric-value">1.2K</span>
          <span className="pricing-creator-preview-metric-label">Followers</span>
        </div>
      </div>

      <section className="pricing-creator-preview-block">
        <h5 className="pricing-creator-preview-block-title">Audience &amp; Accuracy</h5>
        <PerformanceChart tall />
        <ul className="pricing-creator-preview-analytics-list">
          <li>
            <Users strokeWidth={1.6} aria-hidden="true" />
            <span>1,180 new followers this month</span>
          </li>
          <li>
            <BarChart3 strokeWidth={1.6} aria-hidden="true" />
            <span>Flags That Fool Everyone up 18% week over week</span>
          </li>
        </ul>
      </section>
    </PreviewPanel>
  );
}

function PublishingView({ active }: { active: boolean }) {
  return (
    <PreviewPanel active={active}>
      <header className="pricing-creator-preview-header">
        <h4 className="pricing-creator-preview-kicker">Publishing</h4>
        <p className="pricing-creator-preview-sub">
          Ship straight into Let&apos;s Play and the GEOlibrary.
        </p>
      </header>

      <div className="pricing-creator-preview-publish-grid">
        <div className="pricing-creator-preview-publish-card pricing-creator-preview-publish-card--active">
          <p className="pricing-creator-preview-publish-label">Destination</p>
          <p className="pricing-creator-preview-publish-title">Let&apos;s Play</p>
          <p className="pricing-creator-preview-publish-meta">Live quiz surface</p>
        </div>
        <div className="pricing-creator-preview-publish-card">
          <p className="pricing-creator-preview-publish-label">Destination</p>
          <p className="pricing-creator-preview-publish-title">GEOlibrary</p>
          <p className="pricing-creator-preview-publish-meta">Articles &amp; collections</p>
        </div>
      </div>

      <section className="pricing-creator-preview-block">
        <h5 className="pricing-creator-preview-block-title">Ready to Publish</h5>
        <ul className="pricing-creator-preview-rows">
          <li className="pricing-creator-preview-row">
            <div>
              <p className="pricing-creator-preview-row-title">How Long Is a Coastline?</p>
              <p className="pricing-creator-preview-row-meta">Article · Physical geography</p>
            </div>
            <span className="pricing-creator-preview-row-badge">Draft</span>
          </li>
          <li className="pricing-creator-preview-row">
            <div>
              <p className="pricing-creator-preview-row-title">Capital Cities Sprint</p>
              <p className="pricing-creator-preview-row-meta">Quiz · 12 questions</p>
            </div>
            <span className="pricing-creator-preview-row-badge pricing-creator-preview-row-badge--bronze">
              Publish
            </span>
          </li>
        </ul>
      </section>
    </PreviewPanel>
  );
}

function MonetizationView({ active }: { active: boolean }) {
  return (
    <PreviewPanel active={active}>
      <header className="pricing-creator-preview-header">
        <h4 className="pricing-creator-preview-kicker">Future Monetization</h4>
        <p className="pricing-creator-preview-sub">
          Royalties and payouts designed into the model — awaiting payments phase.
        </p>
      </header>

      <div className="pricing-creator-preview-metrics pricing-creator-preview-metrics--compact">
        <div className="pricing-creator-preview-metric">
          <span className="pricing-creator-preview-metric-value">$184.60</span>
          <span className="pricing-creator-preview-metric-label">Last Payout</span>
        </div>
        <div className="pricing-creator-preview-metric">
          <span className="pricing-creator-preview-metric-value">$1.2K</span>
          <span className="pricing-creator-preview-metric-label">Lifetime Earnings</span>
        </div>
        <div className="pricing-creator-preview-metric">
          <span className="pricing-creator-preview-metric-value">62%</span>
          <span className="pricing-creator-preview-metric-label">Creator Share</span>
        </div>
        <div className="pricing-creator-preview-metric">
          <span className="pricing-creator-preview-metric-value">Q3</span>
          <span className="pricing-creator-preview-metric-label">Payouts Phase</span>
        </div>
      </div>

      <section className="pricing-creator-preview-block">
        <h5 className="pricing-creator-preview-block-title">Revenue Streams</h5>
        <ul className="pricing-creator-preview-rows">
          <li className="pricing-creator-preview-row">
            <div>
              <p className="pricing-creator-preview-row-title">Quiz play royalties</p>
              <p className="pricing-creator-preview-row-meta">Per-play revenue share on published quizzes</p>
            </div>
            <span className="pricing-creator-preview-row-badge">Planned</span>
          </li>
          <li className="pricing-creator-preview-row">
            <div>
              <p className="pricing-creator-preview-row-title">Premium article access</p>
              <p className="pricing-creator-preview-row-meta">Member-only GEOlibrary placements</p>
            </div>
            <span className="pricing-creator-preview-row-badge">Planned</span>
          </li>
        </ul>
      </section>
    </PreviewPanel>
  );
}

function ReviewView({ active }: { active: boolean }) {
  return (
    <PreviewPanel active={active}>
      <header className="pricing-creator-preview-header">
        <h4 className="pricing-creator-preview-kicker">Priority Review</h4>
        <p className="pricing-creator-preview-sub">
          Advance submissions move to the front of the review queue.
        </p>
      </header>

      <ul className="pricing-creator-preview-rows pricing-creator-preview-rows--review">
        {REVIEW_QUEUE.map((item, index) => (
          <li key={item.id} className="pricing-creator-preview-row">
            <div>
              <p className="pricing-creator-preview-row-title">{item.title}</p>
              <p className="pricing-creator-preview-row-meta">
                {item.type} · {item.note}
              </p>
            </div>
            <span
              className={cn(
                "pricing-creator-preview-row-badge",
                index === 0 && "pricing-creator-preview-row-badge--bronze",
              )}
            >
              {item.stage === "in-review"
                ? "In review"
                : item.stage === "queued"
                  ? "Queued"
                  : "Changes"}
            </span>
          </li>
        ))}
      </ul>
    </PreviewPanel>
  );
}

function PerformanceChart({ tall = false }: { tall?: boolean }) {
  return (
    <div className={cn("pricing-creator-preview-chart", tall && "pricing-creator-preview-chart--tall")}>
      {CHART_BARS.map((height, index) => (
        <span
          key={index}
          className="pricing-creator-preview-chart-bar"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
