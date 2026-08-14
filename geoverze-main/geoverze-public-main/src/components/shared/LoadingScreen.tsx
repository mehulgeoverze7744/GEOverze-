import { BrandMark } from "@/components/shared/BrandMark";
import { cn } from "@/lib/utils";

/** Full-screen bronze pulse used while heavy scenes/routes load. */
export function LoadingScreen({
  label = "Aligning the universe",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-6",
        className,
      )}
    >
      <span className="relative flex h-16 w-16 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full border border-bronze/25"
        />
        <BrandMark size="lg" />
      </span>
      <p className="text-[0.62rem] uppercase tracking-[0.4em] text-foreground/50">{label}</p>
    </div>
  );
}
