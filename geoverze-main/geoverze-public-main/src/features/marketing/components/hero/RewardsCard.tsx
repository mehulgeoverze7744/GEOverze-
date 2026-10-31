import { Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";

import {
  RewardCardCountdown,
  RewardCardCredits,
} from "@/features/marketing/components/hero/RewardCardLiveData";
import { HERO_REWARDS } from "@/features/marketing/data/rewardsCard";

import "./rewards-card.css";

/** Light rectangular monthly rewards card for the homepage hero. */
export function RewardsCard() {
  return (
    <aside className="rewards-card" aria-label="Monthly rewards">
      <article className="rewards-card__shell">
        <header className="rewards-card__header">
          <span className="rewards-card__kicker">Monthly Rewards</span>
          <h2 className="rewards-card__title">New Rewards Every Month</h2>
        </header>

        <ul className="rewards-card__grid">
          {HERO_REWARDS.map((item) => (
            <li key={item.id}>
              <Link
                to="/geostore/rewards"
                className="rewards-card__tile"
                aria-label={`View ${item.title} rewards`}
              >
                <div className="rewards-card__tile-media">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="rewards-card__tile-img"
                    style={
                      item.imagePosition ? { objectPosition: item.imagePosition } : undefined
                    }
                    width={640}
                    height={400}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="rewards-card__tile-label">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>

        <RewardCardCountdown />
        <RewardCardCredits />

        <div className="rewards-card__actions">
          <Link to="/geostore/rewards" className="rewards-card__btn rewards-card__btn--ghost">
            <span>View All Rewards</span>
            <ArrowRight className="rewards-card__btn-icon" strokeWidth={2.25} aria-hidden />
          </Link>
          <Link to="/play" className="rewards-card__btn rewards-card__btn--solid">
            <Play className="rewards-card__btn-icon" strokeWidth={2.25} aria-hidden />
            <span>Let&apos;s Play</span>
          </Link>
        </div>
      </article>
    </aside>
  );
}
