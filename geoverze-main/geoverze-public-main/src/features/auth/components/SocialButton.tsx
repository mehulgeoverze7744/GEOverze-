import { toast } from "sonner";

import { cn } from "@/lib/utils";

/**
 * OAuth provider buttons. Visual only — OAuth is wired up in the backend
 * phase, so a press explains the state instead of pretending to work.
 */
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

export function SocialButton({
  provider,
  className,
}: {
  provider: keyof typeof PROVIDERS;
  className?: string;
}) {
  const { label, icon } = PROVIDERS[provider];
  return (
    <button
      type="button"
      onClick={() =>
        toast(`${label} isn't connected yet`, {
          description: "Social sign-in activates when the auth backend goes live.",
        })
      }
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
