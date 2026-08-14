import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { geoButtonVariants } from "./geoButtonVariants";

type GeoButtonProps = ComponentProps<"button"> &
  VariantProps<typeof geoButtonVariants> & { asChild?: boolean };

/**
 * GEOverze button. Bronze-forward, token-driven, three intents.
 * Use `asChild` to render a router <Link> with button styling.
 */
export function GeoButton({ className, variant, size, asChild = false, ...props }: GeoButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(geoButtonVariants({ variant, size }), className)} {...props} />;
}
