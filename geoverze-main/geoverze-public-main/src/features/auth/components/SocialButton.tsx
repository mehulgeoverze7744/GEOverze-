import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  exchangeGoogleIdToken,
  initializeGoogleIdentityButton,
  isGoogleSignInInFlight,
  readGoogleClientId,
  type InitializeGoogleIdentityButtonOptions,
} from "@/features/auth/lib/googleGis";
import type { GoogleCredentialResponse } from "@/features/auth/lib/googleGis.types";
import {
  consumeStoredAuthRedirect,
  rememberAuthRedirect,
  resolvePostAuthDestination,
} from "@/features/auth/lib/oauth";
import { cn } from "@/lib/utils";

const PROVIDERS = {
  google: {
    label: "Continue with Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.35 11.1H12v3.2h5.35c-.24 1.4-1.75 4.12-5.35 4.12A6.42 6.42 0 1 1 12 5.58c1.63 0 2.9.66 3.58 1.28l2.34-2.26A9.6 9.6 0 0 0 12 2.1 9.9 9.9 0 1 0 12 21.9c5.7 0 9.47-4 9.47-9.65 0-.65-.07-1.14-.12-1.15Z"
        />
      </svg>
    ),
  },
  apple: {
    label: "Continue with Apple",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.36 12.83c.02 2.6 2.28 3.46 2.3 3.47-.02.06-.36 1.24-1.2 2.45-.72 1.05-1.47 2.1-2.66 2.12-1.16.02-1.54-.69-2.87-.69-1.33 0-1.74.67-2.85.71-1.14.04-2-.11-3.1-1.7C2.6 16.9 1.9 12.24 3.9 9.7c.98-1.26 2.4-2 3.7-2 1.2 0 2.02.7 2.85.7.8 0 1.9-.86 3.3-.73.58.02 2.2.22 3.24 1.72-.08.05-1.9 1.13-1.88 3.4M13.6 5.4c.66-.8 1.11-1.9.99-3-1 .04-2.2.66-2.9 1.46-.62.7-1.15 1.83-1 2.9 1.1.09 2.24-.55 2.9-1.36"
        />
      </svg>
    ),
  },
} as const;

function googleIdentityButtonOptions(
  host: HTMLDivElement,
  clientId: string,
  onCredential: InitializeGoogleIdentityButtonOptions["onCredential"],
): InitializeGoogleIdentityButtonOptions {
  const options: InitializeGoogleIdentityButtonOptions = {
    parent: host,
    clientId,
    onCredential,
  };
  const measuredWidth = host.clientWidth;
  if (measuredWidth > 0) {
    options.width = measuredWidth;
  }
  return options;
}

export function SocialButton({
  provider,
  className,
  next,
}: {
  provider: keyof typeof PROVIDERS;
  className?: string;
  /** Safe in-app path to return to after a successful Google sign-in. */
  next?: string;
}) {
  const { label, icon } = PROVIDERS[provider];
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [pending, setPending] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [gisError, setGisError] = useState<string | null>(null);
  const initGeneration = useRef(0);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse, rawNonce: string) => {
      if (pending || isGoogleSignInInFlight()) return;
      setPending(true);
      try {
        const session = await exchangeGoogleIdToken(response.credential ?? "", rawNonce);
        const requested =
          consumeStoredAuthRedirect() ?? (typeof next === "string" ? next : null);
        const destination = await resolvePostAuthDestination(session.user.id, requested);
        await navigate({ to: destination as never, replace: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Google sign-in failed. Please try again.";
        toast.error(message, { duration: 8000 });
        setPending(false);
        const generation = ++initGeneration.current;
        const host = googleButtonRef.current;
        const clientId = readGoogleClientId();
        if (host && clientId) {
          rememberAuthRedirect(next);
          void initializeGoogleIdentityButton(
            googleIdentityButtonOptions(host, clientId, handleCredential),
          ).then(() => {
            if (initGeneration.current === generation) setGisReady(true);
          });
        }
      }
    },
    [navigate, next, pending],
  );

  useEffect(() => {
    if (provider !== "google") return;
    const clientId = readGoogleClientId();
    const host = googleButtonRef.current;
    if (!clientId) {
      setGisError("Google sign-in is not configured yet. Use email and password.");
      return;
    }
    if (!host) return;

    rememberAuthRedirect(next);
    const generation = ++initGeneration.current;
    let cancelled = false;

    void initializeGoogleIdentityButton(googleIdentityButtonOptions(host, clientId, handleCredential))
      .then(() => {
        if (!cancelled && initGeneration.current === generation) {
          setGisReady(true);
          setGisError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setGisError(error instanceof Error ? error.message : "Could not load Google sign-in.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [handleCredential, next, provider]);

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
          "flex w-full items-center justify-center gap-3 rounded-full border border-bronze/20 bg-charcoal/40 px-5 py-3 text-xs tracking-[var(--tracking-button)] text-foreground/70 transition-all motion-base hover:border-bronze/45 hover:text-foreground active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 motion-reduce:transition-none",
          className,
        )}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full",
        pending && "pointer-events-none opacity-70",
        className,
      )}
      aria-busy={pending}
    >
      {!gisReady && !gisError ? (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-3 rounded-full border border-bronze/20 bg-charcoal/40 px-5 py-3 text-xs tracking-[var(--tracking-button)] text-foreground/70"
        >
          {icon}
          <span>Loading Google sign-in…</span>
        </button>
      ) : null}

      {gisError ? (
        <div className="space-y-2">
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-3 rounded-full border border-bronze/20 bg-charcoal/40 px-5 py-3 text-xs text-foreground/55"
          >
            {icon}
            <span>{label}</span>
          </button>
          <p className="text-center text-[11px] text-foreground/45">{gisError}</p>
        </div>
      ) : (
        <div
          ref={googleButtonRef}
          className={cn(
            "gvrze-google-gis flex w-full justify-center overflow-hidden rounded-full border border-bronze/20 bg-charcoal/40 [&>div]:!w-full",
            !gisReady && "sr-only",
          )}
          data-gvrze-google-button
        />
      )}

      {pending ? (
        <p className="mt-2 text-center text-[11px] text-foreground/50" role="status">
          Completing Google sign-in…
        </p>
      ) : null}
    </div>
  );
}

/** Hairline "or" divider between credential and provider sign-in. */
export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-bronze/15" />
      <span className="text-[0.6rem] uppercase tracking-[0.28em] text-foreground/50">{label}</span>
      <span className="h-px flex-1 bg-bronze/15" />
    </div>
  );
}