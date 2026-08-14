import { cva } from "class-variance-authority";

/**
 * GEOverze button variants. Kept in its own module so the component file only
 * exports components (Fast Refresh stays intact).
 */
export const geoButtonVariants = cva(
  "inline-flex items-center justify-center gap-3 rounded-full whitespace-nowrap text-xs uppercase font-medium tracking-[var(--tracking-button)] transition-all motion-base disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
  {
    variants: {
      variant: {
        primary:
          "bg-bronze/15 border border-bronze/50 text-bronze-glow hover:bg-bronze/25 hover:border-bronze hover:shadow-[var(--glow-bronze)]",
        secondary: "glass-panel text-foreground/80 hover:text-foreground hover:border-bronze/40",
        ghost:
          "border border-transparent text-foreground/60 hover:text-bronze hover:border-bronze/25",
        /* Solid game-lobby fills — no glass, fast hover. */
        solid:
          "bg-gradient-bronze border border-bronze/60 text-background font-semibold shadow-[var(--shadow-game)] transition-[transform,box-shadow,filter] motion-snap hover:brightness-110 hover:shadow-[var(--shadow-game-hover)] active:scale-[0.97]",
        dark: "game-surface-raised text-foreground/85 transition-[transform,color,border-color] motion-snap hover:border-bronze/50 hover:text-bronze-glow active:scale-[0.97]",
      },
      size: {
        sm: "px-4 py-2 text-[0.65rem]",
        md: "px-6 py-3",
        lg: "px-8 py-4 text-[0.78rem]",
        xl: "px-10 py-5 text-[0.85rem] rounded-2xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
