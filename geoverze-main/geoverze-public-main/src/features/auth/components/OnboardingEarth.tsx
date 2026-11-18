import { EARTH_GLOBE_TEXTURES_2K } from "@/components/geoverze/earthGlobeAssets";

/**
 * Welcome-screen Earth: NASA Blue Marble + clouds, CSS-mapped onto a sphere.
 * One planet only — no orbit rings, satellites, or extra globes.
 */
export function OnboardingEarth() {
  return (
    <div className="ob-earth" aria-hidden="true">
      <div className="ob-earth__glow" />
      <div className="ob-earth__sphere">
        <div
          className="ob-earth__surface"
          style={{ backgroundImage: `url("${EARTH_GLOBE_TEXTURES_2K.day}")` }}
        />
        <div
          className="ob-earth__clouds"
          style={{ backgroundImage: `url("${EARTH_GLOBE_TEXTURES_2K.clouds}")` }}
        />
        <div className="ob-earth__light" />
      </div>
    </div>
  );
}
