import { cn } from "@/lib/utils";

/** Official GVRZE navbar wordmark — the only brand mark used in product UI. */
export const GVRZE_WORDMARK_SRC = "/assets/home/gvrze-wordmark.png";
export const GVRZE_WORDMARK_WIDTH = 581;
export const GVRZE_WORDMARK_HEIGHT = 85;

export function GvrzeWordmark({
  className,
  alt = "GVRZE",
  decorative = false,
  fetchPriority,
}: {
  className?: string;
  alt?: string;
  /** When true, the image is hidden from assistive tech (parent already names it). */
  decorative?: boolean;
  fetchPriority?: "high" | "low" | "auto";
}) {
  return (
    <img
      src={GVRZE_WORDMARK_SRC}
      alt={decorative ? "" : alt}
      width={GVRZE_WORDMARK_WIDTH}
      height={GVRZE_WORDMARK_HEIGHT}
      decoding="async"
      draggable={false}
      fetchPriority={fetchPriority}
      className={cn("gvrze-home-wordmark object-contain object-left", className)}
    />
  );
}
