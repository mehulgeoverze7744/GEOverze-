import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Five-star rating with an accessible label. */
export function RatingStars({
  rating,
  reviews,
  className,
  tone = "default",
}: {
  rating: number;
  reviews?: number;
  className?: string;
  tone?: "default" | "light";
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-3 w-3",
              i <= Math.round(rating)
                ? tone === "light"
                  ? "fill-[#555555] text-[#555555]"
                  : "fill-bronze text-bronze"
                : tone === "light"
                  ? "text-[#C5C5C5]"
                  : "text-foreground/50",
            )}
            strokeWidth={1.4}
          />
        ))}
      </span>
      <span className={cn("text-[0.68rem]", tone === "light" ? "text-[#555555]" : "text-foreground/50")}>
        {rating.toFixed(1)}
        {reviews !== undefined ? ` (${reviews})` : ""}
      </span>
      <span className="sr-only">
        Rated {rating.toFixed(1)} out of 5{reviews !== undefined ? ` from ${reviews} reviews` : ""}
      </span>
    </div>
  );
}
