/**
 * Procedural cover art.
 *
 * Every category / quiz / mode carries an `art` key. That key is hashed into a
 * stable hue pair and pattern so covers look intentional without shipping any
 * image bytes. Swapping in real photography later only means returning an
 * image URL from `coverArt()` and rendering it in <CoverArt>.
 */
export type Cover = {
  /** Two oklch stops for the base gradient. */
  from: string;
  to: string;
  /** Which decorative pattern to overlay. */
  pattern: "rings" | "grid" | "waves" | "peaks" | "dots";
};

function hash(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) % 100_000;
  return h;
}

const PATTERNS = ["rings", "grid", "waves", "peaks", "dots"] as const;

export function coverArt(key: string): Cover {
  const h = hash(key);
  // Bronze-anchored hue range (40-95) keeps every cover inside the palette.
  const hue = 40 + (h % 56);
  const shift = 8 + (h % 14);
  return {
    from: `oklch(0.42 0.07 ${hue})`,
    to: `oklch(0.13 0.02 ${hue + shift})`,
    pattern: PATTERNS[h % PATTERNS.length] as Cover["pattern"],
  };
}

/** CSS background layers for a pattern overlay. */
export function patternLayer(pattern: Cover["pattern"]): string {
  switch (pattern) {
    case "rings":
      return "repeating-radial-gradient(circle at 30% 120%, oklch(1 0 0 / 0.07) 0 1px, transparent 1px 22px)";
    case "grid":
      return "linear-gradient(oklch(1 0 0 / 0.06) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.06) 1px, transparent 1px)";
    case "waves":
      return "repeating-linear-gradient(-24deg, oklch(1 0 0 / 0.07) 0 2px, transparent 2px 18px)";
    case "peaks":
      return "repeating-linear-gradient(135deg, oklch(1 0 0 / 0.06) 0 2px, transparent 2px 16px), repeating-linear-gradient(45deg, oklch(1 0 0 / 0.05) 0 2px, transparent 2px 16px)";
    case "dots":
    default:
      return "radial-gradient(oklch(1 0 0 / 0.1) 1px, transparent 1.4px)";
  }
}

export function patternSize(pattern: Cover["pattern"]): string | undefined {
  if (pattern === "grid") return "26px 26px, 26px 26px";
  if (pattern === "dots") return "18px 18px";
  return undefined;
}
