/**
 * Premium Apple-inspired onboarding experience.
 *
 * ALL existing state logic is preserved exactly:
 *  - useOnboardingStore  (step, interests, skillLevel, avatarId, complete)
 *  - Supabase writes     (profiles.avatar_id, profile_preferences)
 *  - Navigation          → /play after completion
 *
 * Only the visual layer has been redesigned.
 */
import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

import { AvatarMark } from "@/features/auth/components/AvatarMark";
import {
  AVATARS,
  INTERESTS,
  SKILL_LEVELS,
  type SkillLevelId,
} from "@/features/auth/data/onboarding";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Design tokens                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

const LOGO = "/assets/gvrze-storefront/gvrze-logo.png";
const TOTAL_STEPS = 5; // Welcome · Interests · Skill · Avatar · Finish

/* ─────────────────────────────────────────────────────────────────────────── */
/* CSS keyframe block (injected once into the page)                            */
/* ─────────────────────────────────────────────────────────────────────────── */

const OB_STYLES = `
  /* ── Step entrance: fade + slide up ── */
  @keyframes ob-enter {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  /* ── Staggered child entrance ── */
  @keyframes ob-fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  /* ── Draw circle (finish checkmark) ── */
  @keyframes ob-draw-circle {
    to { stroke-dashoffset: 0; }
  }
  /* ── Draw check mark ── */
  @keyframes ob-draw-check {
    to { stroke-dashoffset: 0; }
  }
  /* ── Chip press feedback ── */
  @keyframes ob-pop {
    0%  { transform: scale(1); }
    40% { transform: scale(0.94); }
    100%{ transform: scale(1); }
  }

  /* ── Step container ── */
  .ob-step { animation: ob-enter 0.42s cubic-bezier(0.22, 1, 0.36, 1) both; }

  /* ── Staggered children inside a step ── */
  .ob-step > * { animation: ob-fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .ob-step > *:nth-child(1) { animation-delay: 0.04s; }
  .ob-step > *:nth-child(2) { animation-delay: 0.10s; }
  .ob-step > *:nth-child(3) { animation-delay: 0.16s; }
  .ob-step > *:nth-child(4) { animation-delay: 0.22s; }
  .ob-step > *:nth-child(5) { animation-delay: 0.28s; }

  /* ── Chip active press ── */
  .ob-chip:active { animation: ob-pop 0.18s ease both; }

  /* ── Reduced motion overrides ── */
  @media (prefers-reduced-motion: reduce) {
    .ob-step, .ob-step > *, .ob-globe-orbit { animation: none !important; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────── */
/* Progress pills (iOS-style: current = wide pill, done = small dot)           */
/* ─────────────────────────────────────────────────────────────────────────── */

function ProgressPills({ step, total }: { step: number; total: number }) {
  return (
    <div
      className="flex items-center gap-[5px]"
      role="progressbar"
      aria-valuenow={step + 1}
      aria-valuemax={total}
      aria-label={`Step ${step + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-[7px] rounded-full transition-all duration-300 ease-out",
            i < step
              ? "w-[7px] bg-black"       /* completed */
              : i === step
              ? "w-[22px] bg-black"      /* active — wider pill */
              : "w-[7px] bg-black/15",   /* future */
          )}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Primary CTA button                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative h-14 w-full max-w-sm rounded-[16px] bg-black text-[15px] font-semibold tracking-tight text-white",
        "transition-all duration-200 active:scale-[0.97]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2",
      )}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Animated Earth globe                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

function EarthGlobe({ size = 160 }: { size?: number }) {
  const half = size / 2;
  const r = half - 6;
  const orbitRx = r + 22;
  const orbitRy = orbitRx * 0.3;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Atmospheric halo */}
        <radialGradient id="ob-g-atm" cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(80,160,255,0.14)" />
        </radialGradient>
        {/* Ocean sphere — lit top-left */}
        <radialGradient id="ob-g-sph" cx="35%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#c8ecfa" />
          <stop offset="22%"  stopColor="#72b8d8" />
          <stop offset="52%"  stopColor="#3278a8" />
          <stop offset="80%"  stopColor="#18466a" />
          <stop offset="100%" stopColor="#081c2a" />
        </radialGradient>
        {/* Terminator shadow */}
        <radialGradient id="ob-g-shd" cx="70%" cy="68%" r="55%">
          <stop offset="0%"   stopColor="rgba(4,10,22,0.44)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        {/* Specular highlight */}
        <radialGradient id="ob-g-spc" cx="29%" cy="21%" r="30%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.46)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        {/* Orbiting dot gradient */}
        <radialGradient id="ob-g-dot" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#d8f0fa" />
          <stop offset="100%" stopColor="#6ab4d8" />
        </radialGradient>
        {/* Clip to sphere */}
        <clipPath id="ob-g-clip">
          <circle cx={half} cy={half} r={r} />
        </clipPath>
      </defs>

      {/* Atmospheric glow ring */}
      <circle cx={half} cy={half} r={r + 10} fill="url(#ob-g-atm)" />

      {/* Sphere interior (clipped) */}
      <g clipPath="url(#ob-g-clip)">
        <circle cx={half} cy={half} r={r} fill="url(#ob-g-sph)" />
        {/* Latitude ellipses (subtle parallels inside sphere) */}
        <ellipse
          cx={half} cy={half}
          rx={r} ry={r * 0.26}
          fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6"
        />
        <ellipse
          cx={half} cy={half}
          rx={r} ry={r * 0.60}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
        />
        {/* Equator line */}
        <line
          x1={half - r} y1={half}
          x2={half + r} y2={half}
          stroke="rgba(255,255,255,0.09)" strokeWidth="0.6"
        />
        {/* Shadow terminator */}
        <circle cx={half} cy={half} r={r} fill="url(#ob-g-shd)" />
        {/* Specular catchlight */}
        <circle cx={half} cy={half} r={r} fill="url(#ob-g-spc)" />
      </g>

      {/* Orbital ring path (outside clip, in front of sphere) */}
      <ellipse
        id="ob-orbit-path"
        cx={half} cy={half}
        rx={orbitRx} ry={orbitRy}
        fill="none"
        stroke="rgba(0,0,0,0.07)"
        strokeWidth="0.75"
      />

      {/* Orbiting dot — follows the ellipse path */}
      <g className="ob-globe-orbit">
        <animateMotion dur="4.8s" repeatCount="indefinite" calcMode="linear" rotate="0">
          <mpath href="#ob-orbit-path" />
        </animateMotion>
        <circle r="5" fill="url(#ob-g-dot)" />
        <circle r="5" fill="rgba(255,255,255,0.22)" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Animated completion checkmark                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

function AnimatedCheck({ size = 72 }: { size?: number }) {
  const half = size / 2;
  const r = half - 3;
  const circ = +(2 * Math.PI * r).toFixed(1);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      {/* Circle drawing in */}
      <circle
        cx={half} cy={half} r={r}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ}
        style={{ animation: "ob-draw-circle 0.65s cubic-bezier(0.22,1,0.36,1) forwards" }}
      />
      {/* Check drawing in (delayed) */}
      <path
        d={`M ${half * 0.52} ${half} L ${half * 0.86} ${half * 1.32} L ${half * 1.44} ${half * 0.68}`}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="52"
        strokeDashoffset="52"
        style={{ animation: "ob-draw-check 0.38s cubic-bezier(0.22,1,0.36,1) forwards 0.52s" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step 0 — Welcome                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function WelcomeStep({ name }: { name: string | undefined }) {
  return (
    <div className="ob-step flex flex-col items-center gap-6 text-center">
      {/* Wordmark */}
      <img
        src={LOGO}
        alt="GVRZE"
        width={581}
        height={85}
        draggable={false}
        className="select-none"
        style={{ width: 112, height: "auto" }}
      />

      {/* Globe */}
      <EarthGlobe size={170} />

      {/* Copy */}
      <div className="space-y-2">
        <h1 className="text-[2.4rem] font-light leading-[1.1] tracking-tight text-black">
          Welcome to GVRZE.
        </h1>
        {name ? (
          <p className="text-base text-black/40">Hello, {name}.</p>
        ) : null}
        <p className="text-[15px] leading-relaxed text-black/55">
          Know Earth. Think Global.
        </p>
      </div>

      {/* Feature pills — preview what's ahead */}
      <div className="flex flex-wrap justify-center gap-2">
        {["Explore the world", "Play geography games", "Earn rewards"].map((f) => (
          <span
            key={f}
            className="rounded-full border border-black/10 px-3.5 py-1.5 text-[12px] font-medium text-black/50"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step 1 — Interests                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

function InterestsStep({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="ob-step space-y-5">
      <div className="space-y-1">
        <h2 className="text-[1.9rem] font-light leading-tight tracking-tight text-black">
          What interests you?
        </h2>
        <p className="text-[14px] text-black/50">
          Pick everything that excites you. You can change these any time.
        </p>
      </div>

      {/* Chip grid */}
      <div
        role="group"
        aria-label="Choose your interests"
        className="flex flex-wrap gap-2.5"
      >
        {INTERESTS.map((interest) => {
          const on = selected.includes(interest.id);
          return (
            <button
              key={interest.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onToggle(interest.id)}
              className={cn(
                "ob-chip flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[13.5px] font-medium",
                "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-1",
                on
                  ? "border-black bg-black text-white shadow-sm"
                  : "border-black/12 bg-white text-black hover:border-black/28 hover:bg-black/[0.025]",
              )}
            >
              <interest.icon
                className={cn("h-4 w-4 shrink-0", on ? "text-white" : "text-black/55")}
                strokeWidth={1.5}
              />
              {interest.label}
            </button>
          );
        })}
      </div>

      {selected.length > 0 ? (
        <p className="text-[12px] text-black/40">
          {selected.length} selected
        </p>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step 2 — Skill level                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

function SkillStep({
  selected,
  onSelect,
}: {
  selected: SkillLevelId | null;
  onSelect: (id: SkillLevelId) => void;
}) {
  return (
    <div className="ob-step space-y-5">
      <div className="space-y-1">
        <h2 className="text-[1.9rem] font-light leading-tight tracking-tight text-black">
          How well do you know Earth?
        </h2>
        <p className="text-[14px] text-black/50">
          Be honest — GVRZE adapts to you as you improve.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Choose your skill level"
        className="space-y-2.5"
      >
        {SKILL_LEVELS.map((level) => {
          const on = selected === level.id;
          return (
            <button
              key={level.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(level.id as SkillLevelId)}
              className={cn(
                "ob-chip group flex w-full items-center gap-4 rounded-2xl border p-4 text-left",
                "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-1",
                on
                  ? "border-black bg-black/[0.03] shadow-sm"
                  : "border-black/12 hover:border-black/28",
              )}
            >
              {/* Radio indicator */}
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150",
                  on ? "border-black" : "border-black/20 group-hover:border-black/40",
                )}
              >
                {on ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-black" />
                ) : null}
              </span>

              {/* Text */}
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold tracking-tight text-black">
                  {level.label}
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-black/50">
                  {level.description}
                </span>
              </span>

              {/* Tick on selected */}
              {on ? (
                <Check className="ml-auto h-4.5 w-4.5 shrink-0 text-black" strokeWidth={2.2} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step 3 — Avatar selection                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function AvatarStep({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="ob-step space-y-5">
      <div className="space-y-1">
        <h2 className="text-[1.9rem] font-light leading-tight tracking-tight text-black">
          Choose your explorer mark.
        </h2>
        <p className="text-[14px] text-black/50">
          Your mark appears on leaderboards and throughout GVRZE.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Choose your avatar"
        className="grid grid-cols-4 gap-3"
      >
        {AVATARS.map((avatar) => {
          const on = selected === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(avatar.id)}
              className={cn(
                "ob-chip flex flex-col items-center gap-2.5 rounded-2xl p-3",
                "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-1",
                on
                  ? "bg-black/[0.04] ring-2 ring-black ring-offset-1"
                  : "hover:bg-black/[0.025]",
              )}
            >
              <AvatarMark id={avatar.id} size={52} />
              <span
                className={cn(
                  "text-center text-[11px] font-medium leading-snug",
                  on ? "text-black" : "text-black/45",
                )}
              >
                {avatar.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step 4 — Finish                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function FinishStep({
  interests,
  skillLevel,
  avatarId,
}: {
  interests: string[];
  skillLevel: SkillLevelId | null;
  avatarId: string | null;
}) {
  const selectedInterests = INTERESTS.filter((i) => interests.includes(i.id));
  const level = SKILL_LEVELS.find((l) => l.id === skillLevel);

  return (
    <div className="ob-step flex flex-col items-center gap-6 text-center">
      {/* Avatar + animated check overlay */}
      <div className="relative">
        {avatarId ? (
          <AvatarMark id={avatarId} size={88} />
        ) : (
          <div className="h-[88px] w-[88px] rounded-full bg-black/[0.06]" />
        )}
        {/* Animated check badge — bottom right of avatar */}
        <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
          <AnimatedCheck size={28} />
        </span>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h2 className="text-[2.2rem] font-light leading-tight tracking-tight text-black">
          You're all set.
        </h2>
        <p className="text-[15px] text-black/50">Your world starts here.</p>
      </div>

      {/* Summary tags */}
      <div className="space-y-3">
        {selectedInterests.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2">
            {selectedInterests.map((i) => (
              <span
                key={i.id}
                className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1 text-[11.5px] font-medium text-black/55"
              >
                <i.icon className="h-3 w-3 shrink-0" strokeWidth={1.6} />
                {i.label}
              </span>
            ))}
          </div>
        ) : null}

        {level ? (
          <p className="text-[12px] text-black/35">{level.label} track</p>
        ) : null}
      </div>

      <p className="text-[12px] text-black/30">
        You can update your preferences any time in Settings.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Main component                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  /* ── Onboarding store ── */
  const step = useOnboardingStore((s) => s.step);
  const setStep = useOnboardingStore((s) => s.setStep);
  const interests = useOnboardingStore((s) => s.interests);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);
  const skillLevel = useOnboardingStore((s) => s.skillLevel);
  const setSkillLevel = useOnboardingStore((s) => s.setSkillLevel);
  const avatarId = useOnboardingStore((s) => s.avatarId);
  const setAvatarId = useOnboardingStore((s) => s.setAvatarId);
  const complete = useOnboardingStore((s) => s.complete);

  const [entering, setEntering] = useState(false);

  /* ── Advance rules — identical to original ── */
  const canAdvance =
    step === 0 ||
    (step === 1 && interests.length > 0) ||
    (step === 2 && skillLevel !== null) ||
    (step === 3 && avatarId !== null) ||
    step === 4;

  const goTo = (next: number) =>
    setStep(Math.min(Math.max(next, 0), TOTAL_STEPS - 1));

  /* ── Completion — identical Supabase writes + navigation ── */
  const onEnter = () => {
    setEntering(true);
    complete();

    if (user?.id) {
      const userId = user.id;
      void Promise.all([
        supabase
          .from("profiles")
          .update({ avatar_id: avatarId })
          .eq("id", userId)
          .then(({ error }) => {
            if (error) console.error("Failed to persist avatar_id", error);
          }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("profile_preferences")
          .upsert(
            { user_id: userId, interests, skill_level: skillLevel },
            { onConflict: "user_id" },
          )
          .then(({ error }: { error: { message: string } | null }) => {
            if (error) {
              console.error("Failed to persist preferences", error);
              toast.error(
                "Could not save your preferences. You can update them later in Settings.",
              );
            }
          }),
      ]);
    }

    setTimeout(() => navigate({ to: "/play" }), 900);
  };

  /* ── Personalized first name ── */
  const firstName =
    user?.displayName?.split(" ")[0] ??
    user?.username ??
    user?.email?.split("@")[0];

  /* ── CTA label per step ── */
  const ctaLabel =
    step === 0
      ? "Let's Begin"
      : step === 4
      ? entering
        ? "Entering GVRZE…"
        : "Enter GVRZE"
      : "Continue";

  /* ── Skip is available on optional steps 1–3 ── */
  const canSkip = step >= 1 && step <= 3;

  return (
    /*
     * Full-screen white overlay — renders above the site navbar via z-50.
     * Uses display:flex + flex-direction:column to pin header & footer
     * while letting the content area scroll freely.
     */
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* ── Keyframes ── */}
      <style>{OB_STYLES}</style>

      {/* ── Top bar ── */}
      <header className="flex h-14 shrink-0 items-center justify-between px-5">
        {/* Back button — hidden on step 0 */}
        {step > 0 ? (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition-opacity hover:opacity-70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          </button>
        ) : (
          /* Spacer so dots stay centered */
          <div className="h-9 w-9" />
        )}

        {/* Progress pills */}
        <ProgressPills step={step} total={TOTAL_STEPS} />

        {/* Skip */}
        {canSkip ? (
          <button
            type="button"
            onClick={() => goTo(step + 1)}
            className="text-[13px] font-medium text-black/40 transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            Skip
          </button>
        ) : (
          /* Spacer */
          <div className="w-8" />
        )}
      </header>

      {/* ── Scrollable content area ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[460px] px-5 py-8">
          {/* key={step} causes React to remount the step container,
              triggering the ob-enter entrance animation */}
          <div key={step}>
            {step === 0 ? <WelcomeStep name={firstName} /> : null}

            {step === 1 ? (
              <InterestsStep selected={interests} onToggle={toggleInterest} />
            ) : null}

            {step === 2 ? (
              <SkillStep
                selected={skillLevel}
                onSelect={(id) => setSkillLevel(id as SkillLevelId)}
              />
            ) : null}

            {step === 3 ? (
              <AvatarStep selected={avatarId} onSelect={setAvatarId} />
            ) : null}

            {step === 4 ? (
              <FinishStep
                interests={interests}
                skillLevel={skillLevel}
                avatarId={avatarId}
              />
            ) : null}
          </div>
        </div>
      </main>

      {/* ── Bottom action area (safe-area aware) ── */}
      <footer
        className="shrink-0 px-5 pb-6 pt-3"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex w-full max-w-[460px] flex-col items-center gap-3">
          <PrimaryButton
            onClick={step === 4 ? onEnter : () => goTo(step + 1)}
            disabled={!canAdvance || entering}
          >
            {ctaLabel}
          </PrimaryButton>

          {/* Subtle reassurance on step 0 */}
          {step === 0 ? (
            <p className="text-center text-[11.5px] text-black/30">
              Takes less than a minute · Personalised to you
            </p>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
