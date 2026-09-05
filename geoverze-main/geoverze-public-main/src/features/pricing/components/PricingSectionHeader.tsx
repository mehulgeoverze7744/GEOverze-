import type { ReactNode } from "react";

type PricingSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
  centered?: boolean;
  className?: string;
};

/** Compact editorial section header for lower pricing bands. */
export function PricingSectionHeader({
  eyebrow,
  title,
  description,
  action,
  id,
  centered = false,
  className = "",
}: PricingSectionHeaderProps) {
  return (
    <header
      className={`pricing-section-header ${centered ? "pricing-section-header--center" : ""} ${className}`.trim()}
    >
      <div className="pricing-section-header-copy">
        <p className="pricing-section-eyebrow">{eyebrow}</p>
        <h2 id={id} className="pricing-section-title">
          {title}
        </h2>
        {description ? <p className="pricing-section-description">{description}</p> : null}
      </div>
      {action ? <div className="pricing-section-header-action">{action}</div> : null}
    </header>
  );
}
