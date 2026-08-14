import { Link, type LinkProps } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/** Bronze-hairline breadcrumb trail. */
export function Breadcrumb({
  items,
  className,
}: {
  items: { label: string; to?: NonNullable<LinkProps["to"]> }[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.24em]",
        className,
      )}
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 ? <span className="text-foreground/50">/</span> : null}
          {item.to ? (
            <Link to={item.to} className="text-foreground/50 transition-colors hover:text-bronze">
              {item.label}
            </Link>
          ) : (
            <span className="text-bronze">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
