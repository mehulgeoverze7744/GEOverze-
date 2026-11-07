import { cn } from "@/lib/utils";

/** Blur-plate overlay for lookbook product cards. Title sits outside this layer. */
export function ComingSoonImageOverlay({ className }: { className?: string }) {
  return (
    <>
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 z-[1] bg-[rgb(12_14_18/0.38)]", className)}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-3 text-center",
          "text-[clamp(0.75rem,1.6vw,1.05rem)] font-bold uppercase tracking-[0.28em] text-white",
          "[text-indent:0.28em] [text-shadow:0_1px_10px_rgb(0_0_0/0.28)]",
          "font-[family-name:var(--sf-font-ui),Inter,system-ui,sans-serif]",
          className,
        )}
      >
        COMING SOON
      </div>
    </>
  );
}
