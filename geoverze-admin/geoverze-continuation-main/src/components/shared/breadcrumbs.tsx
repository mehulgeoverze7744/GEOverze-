import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

import { findNavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  /** Omit for the current page. */
  to?: string | undefined;
}

export interface BreadcrumbsProps {
  /** Overrides the route-derived trail. */
  items?: Crumb[] | undefined;
  className?: string | undefined;
}

function humanize(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const trail: Crumb[] = items ?? derive(pathname);
  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1">
          <Link
            to="/"
            className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <Home className="size-3" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
              <ChevronRight className="size-3 shrink-0 opacity-60" aria-hidden="true" />
              {last || !crumb.to ? (
                <span className="truncate font-medium text-foreground" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to} className="truncate transition-colors hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function derive(pathname: string): Crumb[] {
  if (pathname === "/") return [];
  const match = findNavItem(pathname);
  if (match) {
    return [{ label: match.group.label }, { label: match.item.title }];
  }
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => ({ label: humanize(segment) }));
}
