import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { BrandMark } from "@/components/shared/BrandMark";
import { cn } from "@/lib/utils";

import "@/features/auth/styles/auth-experience.css";

/**
 * Centered Apple-inspired panel shared by every auth screen.
 *
 * `width` widens the panel for multi-column forms (signup) without any
 * screen re-implementing the shell.
 */
export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
  aside,
  width = "narrow",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Rendered between the heading block and the content (stepper, meta). */
  aside?: ReactNode;
  width?: "narrow" | "wide";
  className?: string;
}) {
  return (
    <div id="gvrze-auth">
      <div className="auth-shell flex flex-col px-5">
        <section className="flex flex-1 items-center justify-center py-6 sm:py-10">
          <div
            className={cn(
              "w-full",
              width === "wide" ? "max-w-[640px]" : "max-w-[400px]",
            )}
          >
            <header className="mb-4">
              <Link
                to="/"
                className="text-[13px] font-medium text-[#86868B] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/40"
              >
                Back to GVRZE
              </Link>
            </header>
            <div
              className={cn(
                "auth-card w-full border border-[#E5E5EA] bg-[rgba(255,255,255,0.88)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-[18px] sm:p-8",
                width === "wide" ? "rounded-[28px]" : "rounded-[26px]",
                className,
              )}
            >
            <Link
              to="/"
              aria-label="GVRZE home"
              className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/40"
            >
              <BrandMark size="sm" withWordmark className="h-5 w-auto opacity-90 sm:h-[1.35rem]" />
            </Link>

            {eyebrow ? (
              <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                {eyebrow}
              </p>
            ) : (
              <div className="mt-7" />
            )}
            <h1 className="mt-2 text-[1.7rem] font-semibold leading-[1.15] tracking-[-0.022em] text-[#1D1D1F] sm:text-[1.85rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-2.5 text-[15px] leading-relaxed text-[#86868B]">{description}</p>
            ) : null}

            {aside ? <div className="mt-6">{aside}</div> : null}

            <div className="mt-6 sm:mt-7">{children}</div>

            {footer ? (
              <div className="mt-7 border-t border-[#E5E5EA] pt-5 text-[14px] text-[#86868B]">
                {footer}
              </div>
            ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
