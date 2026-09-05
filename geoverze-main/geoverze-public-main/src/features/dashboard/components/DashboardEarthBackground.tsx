import { DASHBOARD_EARTH_SRC } from "@/features/dashboard/lib/dashboardAssets";

/**
 * Earth decorative layer scoped to the main dashboard card.
 * Clipped by the card's overflow:hidden — never renders at page level.
 */
export function DashboardEarthBackground() {
  return (
    <div className="dashboard-earth-layer" aria-hidden="true">
      <div className="dashboard-earth-stage">
        <img
          src={DASHBOARD_EARTH_SRC}
          alt=""
          className="dashboard-earth-image"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
