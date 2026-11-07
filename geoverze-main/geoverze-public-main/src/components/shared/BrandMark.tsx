import { memo } from "react";

import { cn } from "@/lib/utils";

import { GvrzeWordmark } from "./GvrzeWordmark";

const heights = {
  sm: "h-4",
  md: "h-[1.15rem] md:h-6",
  lg: "h-6 md:h-7",
  xl: "h-9 md:h-11",
  fill: "h-full",
} as const;

/**
 * Official GVRZE wordmark. Same PNG as the main navbar — never the old
 * circular emblem, never a text recreation.
 */
export const BrandMark = memo(function BrandMark({
  size = "md",
  withWordmark: _withWordmark = false,
  sheen: _sheen = true,
  className,
  wordmarkClassName: _wordmarkClassName,
}: {
  size?: keyof typeof heights;
  /** Kept for callers. The asset is already the wordmark. */
  withWordmark?: boolean;
  sheen?: boolean;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <GvrzeWordmark
      decorative
      className={cn("w-auto max-w-full", heights[size], className)}
    />
  );
});
