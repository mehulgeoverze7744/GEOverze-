import { Award } from "lucide-react";

import type { CreditProductAchievement } from "../data/fetchCreditProductAchievements";
import { cn } from "@/lib/utils";

function formatAcquiredOn(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fulfillmentLabel(type: string) {
  if (type === "physical") return "Physical";
  if (type === "digital") return "Digital";
  return null;
}

/** Premium dashboard tile for one completed GeoCredit product acquisition. */
export function CreditProductAchievementCard({
  achievement,
  className,
}: {
  achievement: CreditProductAchievement;
  className?: string;
}) {
  const acquiredOn = formatAcquiredOn(achievement.acquiredAt);
  const kind = fulfillmentLabel(achievement.fulfillmentType);

  return (
    <article
      className={cn(
        "dashboard-achievement flex h-full flex-col rounded-2xl border border-bronze/45 bg-bronze/12 p-4 text-bronze shadow-[0_0_20px_rgba(180,140,80,0.1)]",
        className,
      )}
    >
      <span
        className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-bronze/40 bg-bronze/15"
        aria-hidden="true"
      >
        {achievement.imageSrc ? (
          <img
            src={achievement.imageSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Award className="h-4 w-4" strokeWidth={1.4} />
        )}
      </span>
      <p className="mt-4 text-xs font-medium text-foreground/90">{achievement.productName}</p>
      <p className="mt-1 text-[0.65rem] leading-relaxed text-foreground/50">
        Acquired with GeoCredits
        {kind ? ` · ${kind}` : ""}
        {achievement.quantity > 1 ? ` · Qty ${achievement.quantity}` : ""}
      </p>
      <p className="mt-3 text-[0.58rem] uppercase tracking-[0.16em] text-foreground/45">
        {achievement.creditsSpent} GeoCredits
        {acquiredOn ? ` · ${acquiredOn}` : ""}
      </p>
    </article>
  );
}
