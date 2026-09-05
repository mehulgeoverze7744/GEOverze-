import { ArrowRight } from "lucide-react";

type BenefitItemProps = {
  index: number;
  title: string;
};

function splitHeadline(title: string) {
  const words = title.trim().split(/\s+/);
  return {
    primary: words[0] ?? title,
    secondary: words.slice(1).join(" "),
  };
}

/** Editorial benefit column — number + bold headline only. */
export function BenefitItem({ index, title }: BenefitItemProps) {
  const number = String(index + 1).padStart(2, "0");
  const { primary, secondary } = splitHeadline(title);

  return (
    <article className="pricing-benefit">
      <div className="pricing-benefit-glow" aria-hidden="true" />
      <p className="pricing-benefit-number" aria-hidden="true">
        {number}
      </p>
      <h3 className="pricing-benefit-title">
        <span className="pricing-benefit-title-line">{primary}</span>
        {secondary ? (
          <span className="pricing-benefit-title-line">{secondary}</span>
        ) : null}
      </h3>
      <ArrowRight className="pricing-benefit-arrow" strokeWidth={1.6} aria-hidden="true" />
    </article>
  );
}
