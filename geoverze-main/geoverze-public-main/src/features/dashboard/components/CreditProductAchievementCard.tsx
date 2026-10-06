import { Award } from "lucide-react";
import { useState } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import type { CreditProductAchievement } from "../data/fetchCreditProductAchievements";
import { cn } from "@/lib/utils";

const BALLOON_COUNT = 5;
const CONFETTI_COUNT = 6;

/** Decorative hover celebration — mounted only while a burst is active. */
function CelebrationBurst({ onDone }: { onDone: () => void }) {
  return (
    <span className="dashboard-achievement-burst" aria-hidden="true">
      {Array.from({ length: BALLOON_COUNT }, (_, i) => (
        <span
          key={`b${i}`}
          className={`dashboard-achievement-balloon dashboard-achievement-balloon--${i + 1}`}
          onAnimationEnd={i === BALLOON_COUNT - 1 ? onDone : undefined}
        />
      ))}
      {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
        <span
          key={`c${i}`}
          className={`dashboard-achievement-confetti dashboard-achievement-confetti--${i + 1}`}
        />
      ))}
    </span>
  );
}

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
  celebrate = false,
}: {
  achievement: CreditProductAchievement;
  className?: string;
  /** Opt-in hover celebration (Dashboard strip only). */
  celebrate?: boolean;
}) {
  const acquiredOn = formatAcquiredOn(achievement.acquiredAt);
  const kind = fulfillmentLabel(achievement.fulfillmentType);
  const reducedMotion = useReducedMotion();
  // Incrementing key restarts the burst on every fresh hover; 0 = idle.
  const [burst, setBurst] = useState(0);
  const showBurst = celebrate && !reducedMotion && burst > 0;

  return (
    <article
      className={cn(
        "dashboard-achievement flex h-full flex-col rounded-2xl border border-bronze/45 bg-bronze/12 p-4 text-bronze shadow-[0_0_20px_rgba(180,140,80,0.1)]",
        celebrate && "dashboard-achievement--celebrate",
        className,
      )}
      onPointerEnter={celebrate ? () => setBurst((n) => n + 1) : undefined}
    >
      {showBurst ? <CelebrationBurst key={burst} onDone={() => setBurst(0)} /> : null}
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
