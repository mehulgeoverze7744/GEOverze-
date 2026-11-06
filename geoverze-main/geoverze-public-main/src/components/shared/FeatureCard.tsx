import type { LucideIcon } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import { GlassCard } from "./GlassCard";

function FeatureCardContent({
  icon: Icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <>
      {Icon ? (
        <span
          aria-hidden
          className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10 text-bronze"
        >
          <Icon className="h-5 w-5" strokeWidth={1.4} />
        </span>
      ) : null}
      <h3 className="text-base font-medium tracking-tight text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-foreground/55">{description}</p>
    </>
  );
}

/** Icon + title + copy card used across marketing and module pages. */
export const FeatureCard = memo(function FeatureCard({
  icon,
  title,
  description,
  imageSrc,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  /** Optional cinematic background — used on the Home page feature pillars. */
  imageSrc?: string;
}) {
  if (imageSrc) {
    return (
      <GlassCard
        interactive
        className={cn(
          "group relative isolate overflow-hidden p-0",
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={imageSrc}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
        <div className="relative z-10 p-7">
          {/* exactOptionalPropertyTypes: spread icon only when defined */}
          <FeatureCardContent {...(icon !== undefined && { icon })} title={title} description={description} />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard interactive className="p-7">
      <FeatureCardContent {...(icon !== undefined && { icon })} title={title} description={description} />
    </GlassCard>
  );
});
