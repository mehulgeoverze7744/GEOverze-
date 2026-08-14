import { memo } from "react";

import emblemUrl from "@/assets/geoverze-emblem.png";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const sizes = {
  sm: 32,
  md: 36,
  lg: 40,
  xl: 150,
  fill: 0,
} as const;

/**
 * Official GEOverze emblem. Single source for every brand surface (navbar,
 * footer, auth, hero, loading) so sizing, retina rendering and the ambient
 * bronze sheen stay identical everywhere.
 */
export const BrandMark = memo(function BrandMark({
  size = "md",
  withWordmark = false,
  sheen = true,
  className,
  wordmarkClassName,
}: {
  size?: keyof typeof sizes;
  withWordmark?: boolean;
  sheen?: boolean;
  className?: string;
  wordmarkClassName?: string;
}) {
  const px = sizes[size];
  const fill = px === 0;

  const mark = (
    <span
      className={cn(
        "brand-mark relative inline-flex items-center justify-center",
        fill ? "h-full w-full" : "shrink-0",
        sheen && "brand-sheen",
        className,
      )}
      {...(fill ? {} : { style: { width: px, height: px } })}
    >
      <img
        src={emblemUrl}
        alt=""
        width={fill ? 300 : px * 2}
        height={fill ? 300 : px * 2}
        decoding="async"
        className="h-full w-full object-contain"
      />
    </span>
  );

  if (!withWordmark) return mark;

  return (
    <span className="group/brand inline-flex items-center gap-3">
      {mark}
      <span
        className={cn(
          "text-[0.78rem] uppercase tracking-[0.38em] text-foreground/85 transition-colors motion-base group-hover/brand:text-bronze-glow",
          wordmarkClassName,
        )}
      >
        {site.name}
      </span>
    </span>
  );
});
