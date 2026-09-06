/**
 * Earth surface assets for the home hero globe.
 *
 * Desktop (4K — 4096×2048 equirectangular JPEG):
 * - Day: NASA Blue Marble (2016) via three-globe/unpkg
 * - Night: NASA Black Marble city lights via three-globe/unpkg
 * - Bump: NASA elevation bump (webgl-earth elev_bump_4k)
 * - Clouds: Solar System Scope 8k clouds → 4K JPEG mask (CC BY 4.0, white=cloud/black=clear)
 *
 * Mobile (2K — 2048×1024): downscaled counterparts for bandwidth/GPU memory.
 */
export const EARTH_GLOBE_TEXTURES_4K = {
  day: "/assets/globe/earth-day.jpg",
  night: "/assets/globe/earth-night.jpg",
  bump: "/assets/globe/earth-bump.jpg",
  clouds: "/assets/globe/earth-clouds.jpg",
} as const;

export const EARTH_GLOBE_TEXTURES_2K = {
  day: "/assets/globe/earth-day-2k.jpg",
  night: "/assets/globe/earth-night-2k.jpg",
  bump: "/assets/globe/earth-bump-2k.jpg",
  clouds: "/assets/globe/earth-clouds-2k.jpg",
} as const;

export function earthGlobeTextures(mobile: boolean) {
  return mobile ? EARTH_GLOBE_TEXTURES_2K : EARTH_GLOBE_TEXTURES_4K;
}

/** Shared sun position — logo/left side of scene (camera at +Z, emblem at −X). */
export const EARTH_SUN_POSITION = [-5, 4, 6] as const;
