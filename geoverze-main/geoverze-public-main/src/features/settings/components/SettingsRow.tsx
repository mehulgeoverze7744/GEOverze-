import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function SettingsGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="settings-group-label">{label}</h2>
      <div className="settings-group">{children}</div>
    </section>
  );
}

type SettingsRowProps = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  value?: string;
  control?: ReactNode;
  onClick?: () => void;
  href?: never;
  static?: boolean;
  danger?: boolean;
  className?: string;
};

/** Product-style settings row with optional navigation or control. */
export function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  value,
  control,
  onClick,
  static: isStatic = false,
  danger = false,
  className,
}: SettingsRowProps) {
  const interactive = Boolean(onClick) && !isStatic;
  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={interactive ? onClick : undefined}
      aria-label={interactive ? (subtitle ? `${title}. ${subtitle}` : title) : undefined}
      className={cn(
        "settings-row",
        isStatic && "settings-row--static",
        danger && "settings-row--danger",
        className,
      )}
    >
      {Icon ? (
        <span className="settings-row-icon" aria-hidden="true">
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </span>
      ) : null}
      <div className="settings-row-body">
        <div className="settings-row-title">{title}</div>
        {subtitle ? <div className="settings-row-subtitle">{subtitle}</div> : null}
      </div>
      <span className="settings-row-trailing">
        {value ? <span className="settings-row-value">{value}</span> : null}
        {control}
        {interactive && !control ? (
          <ChevronRight className="settings-row-chevron h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        ) : null}
      </span>
    </Tag>
  );
}
