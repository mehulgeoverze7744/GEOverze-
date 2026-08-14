import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Heading row used above every dashboard/profile section and widget group. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <Tag
          className={cn(
            "font-light tracking-tight text-foreground",
            eyebrow ? "mt-3" : "",
            Tag === "h2" ? "text-[clamp(1.35rem,2.4vw,1.9rem)]" : "text-lg",
          )}
        >
          {title}
        </Tag>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/50">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
