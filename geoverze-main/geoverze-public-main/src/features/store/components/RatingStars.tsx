import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Five-star rating with an accessible label. */
export function RatingStars({
  rating,
  reviews,
  className,
}: {
  rating: number;
  reviews?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-3 w-3",
              i <= Math.round(rating) ? "fill-bronze text-bronze" : "text-foreground/50",
            )}
            strokeWidth={1.4}
          />
        ))}
      </span>
      <span className="text-[0.68rem] text-foreground/50">
        {rating.toFixed(1)}
        {reviews !== undefined ? ` (${reviews})` : ""}
      </span>
      <span className="sr-only">
        Rated {rating.toFixed(1)} out of 5{reviews !== undefined ? ` from ${reviews} reviews` : ""}
      </span>
    </div>
  );
}
