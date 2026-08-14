import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shell for every screen in the quiz engine.
 *
 * Keeps the universe background visible but drops the glass: content sits on
 * solid game surfaces, centred, with generous touch spacing on mobile.
 */
export function QuizLayout({
  children,
  className,
  width = "default",
  header,
}: {
  children: ReactNode;
  className?: string;
  width?: "narrow" | "default" | "wide";
  header?: ReactNode;
}) {
  return (
    <div className="min-h-dvh pb-24">
      {header}
      <div
        className={cn(
          "mx-auto w-full px-4 sm:px-6 md:px-10",
          width === "narrow" && "max-w-2xl",
          width === "default" && "max-w-4xl",
          width === "wide" && "max-w-6xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
