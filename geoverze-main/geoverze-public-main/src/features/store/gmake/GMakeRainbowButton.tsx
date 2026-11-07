import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type GMakeRainbowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/** Black pill with the Figma conic-gradient rim used on Customization / BUY NOW. */
export function GMakeRainbowButton({
  children,
  className,
  type = "button",
  ...props
}: GMakeRainbowButtonProps) {
  return (
    <button type={type} className={cn("gmake-rainbow", className)} {...props}>
      <span className="gmake-rainbow__inner">{children}</span>
    </button>
  );
}
