import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

type SupportRowProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  to: NonNullable<LinkProps["to"]>;
};

/** Compact support navigation row. */
export function SupportRow({ icon: Icon, title, subtitle, to }: SupportRowProps) {
  return (
    <Link
      to={to}
      className="support-row group"
      aria-label={`${title}. ${subtitle}`}
    >
      <span className="support-row-icon" aria-hidden="true">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <div className="support-row-body">
        <div className="support-row-title">{title}</div>
        <div className="support-row-subtitle">{subtitle}</div>
      </div>
      <ChevronRight
        className="support-row-chevron h-4 w-4"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </Link>
  );
}

type SupportGroupProps = {
  label: string;
  children: ReactNode;
};

export function SupportGroup({ label, children }: SupportGroupProps) {
  return (
    <section>
      <h2 className="support-group-label">{label}</h2>
      <div className="support-group">{children}</div>
    </section>
  );
}
