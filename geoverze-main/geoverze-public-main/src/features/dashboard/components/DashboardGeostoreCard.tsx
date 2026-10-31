import { Link } from "@tanstack/react-router";

import { SF_ASSETS } from "@/features/store/storefront/storefront-assets";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { cn } from "@/lib/utils";

import "./dashboard-geostore-widget.css";

/** Promotional Gstore banner — live credits plus the storefront hero. */
export function DashboardGeostoreCard({ className }: { className?: string }) {
  const credits = useProgressionStore(selectPlayer).credits;
  const creditLabel = Number.isFinite(credits) ? Math.max(0, credits).toLocaleString() : "0";

  return (
    <section
      className={cn("dashboard-geostore", className)}
      aria-labelledby="dashboard-geostore-heading"
    >
      <div className="dashboard-geostore__grid">
        <div className="dashboard-geostore__copy">
          <p className="dashboard-geostore__label">Gstore</p>
          <h2 id="dashboard-geostore-heading" className="dashboard-geostore__title">
            Explore the Gstore
          </h2>
          <p className="dashboard-geostore__dek">
            Discover exclusive drops, premium merchandise and rewards.
          </p>
          <p className="dashboard-geostore__credits">
            <span className="dashboard-geostore__credits-value">{creditLabel}</span>
            <span className="dashboard-geostore__credits-meta">GVRZE credits available</span>
          </p>
          <div className="dashboard-geostore__actions">
            <Link to="/geostore" className="dashboard-geostore__cta">
              VISIT Gstore
            </Link>
            <Link to="/geostore/rewards" className="dashboard-geostore__link">
              VIEW REWARDS
            </Link>
          </div>
        </div>

        <figure className="dashboard-geostore__visual">
          <img
            src={SF_ASSETS.hero.src}
            width={SF_ASSETS.hero.width}
            height={SF_ASSETS.hero.height}
            alt="Three models in GVRZE streetwear: a black tee, a pink tee seen from behind, and a white hoodie"
            decoding="async"
            className="dashboard-geostore__visual-img"
          />
        </figure>
      </div>
    </section>
  );
}
