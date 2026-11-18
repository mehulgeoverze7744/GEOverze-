import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  isGoogleSignInInFlight,
  startGoogleIdentitySignIn,
} from "@/features/auth/lib/googleGis";
import {
  consumeStoredAuthRedirect,
  resolvePostAuthDestination,
} from "@/features/auth/lib/oauth";
import { cn } from "@/lib/utils";

const GoogleMark = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.94 1 10.93 1 12s.43 3.06 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AppleMark = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-white" aria-hidden="true">
    <path
      fill="currentColor"
      d="M16.36 12.83c.02 2.6 2.28 3.46 2.3 3.47-.02.06-.36 1.24-1.2 2.45-.72 1.05-1.47 2.1-2.66 2.12-1.16.02-1.54-.69-2.87-.69-1.33 0-1.74.67-2.85.71-1.14.04-2-.11-3.1-1.7C2.6 16.9 1.9 12.24 3.9 9.7c.98-1.26 2.4-2 3.7-2 1.2 0 2.02.7 2.85.7.8 0 1.9-.86 3.3-.73.58.02 2.2.22 3.24 1.72-.08.05-1.9 1.13-1.88 3.4M13.6 5.4c.66-.8 1.11-1.9.99-3-1 .04-2.2.66-2.9 1.46-.62.7-1.15 1.83-1 2.9 1.1.09 2.24-.55 2.9-1.36"
    />
  </svg>
);

const socialButtonClass =
  "flex h-[54px] w-full items-center justify-center gap-3 rounded-[16px] px-5 text-[15px] font-medium transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/35 disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100";

export function SocialButton({
  provider,
  className,
  next,
}: {
  provider: "google" | "apple";
  className?: string;
  /** Safe in-app path to return to after a successful Google sign-in. */
  next?: string;
}) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const onGoogleClick = async () => {
    if (pending || isGoogleSignInInFlight()) return;
    setPending(true);
    try {
      const { session } = await startGoogleIdentitySignIn(next);
      const requested =
        consumeStoredAuthRedirect() ?? (typeof next === "string" ? next : null);
      const destination = await resolvePostAuthDestination(session.user.id, requested);
      await navigate({ to: destination as never, replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google sign-in failed. Please try again.";
      if (message !== "GOOGLE_SIGNIN_IN_FLIGHT") {
        toast.error(message, { duration: 8000 });
      }
      setPending(false);
    }
  };

  const onAppleClick = () => {
    toast("Continue with Apple isn't available yet", {
      description: "Use email and password, or Continue with Google.",
    });
  };

  if (provider === "apple") {
    return (
      <button
        type="button"
        onClick={onAppleClick}
        className={cn(
          socialButtonClass,
          "bg-[#111111] text-white hover:bg-black",
          className,
        )}
      >
        {AppleMark}
        <span>Continue with Apple</span>
      </button>
    );
  }

  return (
    <div className={cn("relative w-full", pending && "pointer-events-none", className)} aria-busy={pending}>
      <button
        type="button"
        onClick={() => void onGoogleClick()}
        disabled={pending}
        className={cn(
          socialButtonClass,
          "border border-[#E5E5EA] bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]",
        )}
      >
        {GoogleMark}
        <span>{pending ? "Completing Google sign-in…" : "Continue with Google"}</span>
      </button>
    </div>
  );
}

/** Hairline divider between credential and provider sign-in. */
export function AuthDivider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-[#E5E5EA]" />
      <span className="text-[12px] text-[#86868B]">{label}</span>
      <span className="h-px flex-1 bg-[#E5E5EA]" />
    </div>
  );
}
