import { useRef } from "react";
import {
  BookOpen,
  PenTool,
  Swords,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { UpgradeBeat } from "../data/story";
import { useCardPointerTilt } from "../lib/useCardPointerTilt";

const BEAT_ICONS: Record<UpgradeBeat["id"], LucideIcon> = {
  learning: BookOpen,
  competition: Swords,
  creation: PenTool,
  community: Users,
  growth: TrendingUp,
};

type UpgradeRosterCardProps = {
  beat: UpgradeBeat;
  index: number;
};

/** Opaque metallic gold roster panel — 3D floating spacecraft panel. */
export function UpgradeRosterCard({ beat, index }: UpgradeRosterCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const number = String(index + 1).padStart(2, "0");
  const Icon = BEAT_ICONS[beat.id];

  useCardPointerTilt(cardRef);

  return (
    <article ref={cardRef} className="upgrade-roster-card" tabIndex={0}>
      <div className="upgrade-roster-card-shell">
        <div className="upgrade-roster-card-ground" aria-hidden="true" />
        <div className="upgrade-roster-card-plate" aria-hidden="true" />
        <div className="upgrade-roster-card-edge" aria-hidden="true" />
        <div className="upgrade-roster-card-face">
          <div className="upgrade-roster-card-sheen" aria-hidden="true" />
          <div className="upgrade-roster-card-head">
            <p className="upgrade-roster-number" aria-hidden="true">
              {number}
            </p>
            <Icon className="upgrade-roster-icon" strokeWidth={1.5} aria-hidden="true" />
            <p className="upgrade-roster-eyebrow">{beat.eyebrow}</p>
          </div>
          <h3 className="upgrade-roster-title">{beat.title}</h3>
          <p className="upgrade-roster-description">{beat.description}</p>
          <ul className="upgrade-roster-tags">
            {beat.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
