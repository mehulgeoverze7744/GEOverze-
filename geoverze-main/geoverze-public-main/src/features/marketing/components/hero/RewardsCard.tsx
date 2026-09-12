import { Link } from "@tanstack/react-router";
import { useRef, type RefObject } from "react";

import { HERO_REWARDS } from "@/features/marketing/data/rewardsCard";
import {
  RewardCardCountdown,
  RewardCardCredits,
} from "@/features/marketing/components/hero/RewardCardLiveData";
import { useRewardsCardMotion } from "@/features/marketing/components/hero/useRewardsCardMotion";

import "./rewards-card.css";

const CARD_FRAME_ART = "/assets/rewards/geoverze-rewards-card-blank-transparent.png";
const LETS_PLAY_EMBLEM = "/assets/rewards/lets-play-emblem.png";
const VIEW_ALL_REWARDS_BUTTON = "/assets/rewards/view-all-rewards-button.png";

type RewardsCardProps = {
  /** Mutable scroll progress ref from the pinned hero (0 → 1). */
  scrollProgress?: RefObject<number>;
};

/** Interactive 3D DOM rewards card — bronze frame artwork + live inner UI. */
export function RewardsCard({ scrollProgress }: RewardsCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useRewardsCardMotion(stageRef, shadowRef, glowRef, scrollProgress);

  return (
    <div className="rewards-card">
      <div className="rewards-card__perspective">
        <div ref={shadowRef} className="rewards-card__shadow" aria-hidden />
        <div ref={glowRef} className="rewards-card__glow" aria-hidden />

        <div ref={stageRef} className="rewards-card__stage">
          <article className="rewards-card__shell" aria-label="Monthly rewards">
            <div className="rewards-card__frame-layer">
              <img
                src={CARD_FRAME_ART}
                alt=""
                aria-hidden
                className="rewards-card__frame"
                width={1024}
                height={1024}
                decoding="async"
                fetchPriority="high"
              />
            </div>

            <div className="rewards-card__inner">
              <div className="rewards-card__main">
                <header className="rewards-card__header">
                  <h2 className="rewards-card__title">MONTHLY REWARDS</h2>
                  <p className="rewards-card__subtitle">NEW REWARDS EVERY MONTH</p>
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
                              item.imagePosition
                                ? { objectPosition: item.imagePosition }
                                : undefined
                            }
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <p className="rewards-card__tile-label">{item.title}</p>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="rewards-card__stats">
                  <RewardCardCountdown />
                  <RewardCardCredits />
                </div>
              </div>
            </div>

            <div className="rewards-card__footer">
              <div className="rewards-card__slot-area">
                <Link
                  to="/geostore/rewards"
                  className="rewards-card__cta"
                  aria-label="View all rewards"
                >
                  <img
                    src={VIEW_ALL_REWARDS_BUTTON}
                    alt=""
                    aria-hidden
                    className="rewards-card__cta-img"
                    width={1024}
                    height={374}
                    decoding="async"
                  />
                </Link>
              </div>
              <p className="rewards-card__conditions">Conditions apply.</p>
            </div>

            <Link
              to="/play"
              className="rewards-card__play-emblem"
              aria-label="Let's Play"
            >
              <img
                src={LETS_PLAY_EMBLEM}
                alt=""
                aria-hidden
                className="rewards-card__play-emblem-img"
                width={512}
                height={512}
                decoding="async"
              />
            </Link>
          </article>
        </div>
      </div>
    </div>
  );
}
