import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type ActivityTone = "quiz" | "achievement" | "credits" | "bookmark";

const TONE_STYLE: Record<ActivityTone, string> = {
  quiz: "border-bronze/30 bg-bronze/8 text-bronze",
  achievement: "border-bronze/45 bg-bronze/15 text-bronze-glow",
  credits: "border-bronze/25 bg-charcoal/60 text-bronze/90",
  bookmark: "border-bronze/18 bg-charcoal/50 text-foreground/60",
};

/**
 * One row of the unified recent-activity feed.
 * Renders as a link when `to` is provided, otherwise as a static row.
 */
export function ActivityFeedItem({
  icon: Icon,
  title,
  detail,
  when,
  tone = "quiz",
  to,
  className,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  when: string;
  tone?: ActivityTone;
  to?: NonNullable<LinkProps["to"]>;
  className?: string;
}) {
  const body = (
    <>
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
          TONE_STYLE[tone],
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-foreground/85">{title}</span>
        <span className="mt-1 block truncate text-xs text-foreground/50">{detail}</span>
      </span>
      <span className="shrink-0 text-[0.6rem] uppercase tracking-[0.18em] text-foreground/50">
        {when}
      </span>
    </>
  );

  const shell = cn(
    "flex items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition-colors motion-fast",
    to &&
      "hover:border-bronze/25 hover:bg-bronze/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45",
    className,
  );

  return (
    <li>
      {to ? (
        <Link to={to} className={shell}>
          {body}
        </Link>
      ) : (
        <div className={shell}>{body}</div>
      )}
    </li>
  );
}
