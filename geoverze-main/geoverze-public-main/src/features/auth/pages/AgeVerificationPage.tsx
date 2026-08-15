import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { GeoButton } from "@/components/shared/GeoButton";
import { AuthLayout } from "@/features/auth/components";
import { supabase } from "@/lib/supabase/client";
import { useOnboardingStore } from "@/stores/onboardingStore";

/** Persists the age answer to the DB via the SECURITY DEFINER RPC. Non-blocking. */
async function persistAgeBracket(bracket: "adult" | "minor") {
  const { error } = await supabase.rpc("set_age_bracket", { _bracket: bracket });
  if (error) {
    console.error("Failed to persist age bracket", error);
    toast.error("Could not save your age answer. You can continue, but you may be asked again.");
  }
}

/**
 * Mandatory age check that runs once inside the signup journey.
 *
 * A "no" answer never blocks learning — it only removes prize-based
 * competitive modes, and the copy stays welcoming about it.
 */
export function AgeVerificationPage() {
  const navigate = useNavigate();
  const answer = useOnboardingStore((s) => s.ageAnswer);
  const setAgeAnswer = useOnboardingStore((s) => s.setAgeAnswer);

  if (answer === "minor") {
    return (
      <PageShell>
        <AuthLayout
          eyebrow="Learner mode"
          title="Your learning universe is open"
          description="Prize-based competitive modes are reserved for players aged 18 and above, in line with applicable regulations. Everything built for learning stays fully available to you."
        >
          <div className="space-y-6">
            <ul className="space-y-3">
              {[
                {
                  icon: BookOpen,
                  title: "Every educational quiz",
                  copy: "Countries, capitals, flags, maps, nature and culture — all unlocked.",
                },
                {
                  icon: Sparkles,
                  title: "Progress, streaks and badges",
                  copy: "Track mastery and climb the free knowledge ladder.",
                },
                {
                  icon: ShieldCheck,
                  title: "Prize modes stay paused",
                  copy: "They unlock automatically when you're eligible.",
                },
              ].map(({ icon: Icon, title, copy }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 rounded-2xl border border-bronze/15 bg-charcoal/35 p-4"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-bronze/20 text-bronze">
                    <Icon className="h-4 w-4" strokeWidth={1.3} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-light text-foreground">{title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-foreground/50">
                      {copy}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row">
              <GeoButton asChild variant="primary" size="lg" className="flex-1">
                <Link to="/auth/onboarding">Continue to setup</Link>
              </GeoButton>
              <GeoButton
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={() => setAgeAnswer("unanswered")}
              >
                Change my answer
              </GeoButton>
            </div>
          </div>
        </AuthLayout>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AuthLayout
        eyebrow="Eligibility"
        title="Are you 18 years old or above?"
        description="We ask once. Your answer decides whether prize-based competitive modes are available — educational play is open to everyone either way."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <GeoButton
              variant="primary"
              size="lg"
              onClick={() => {
                setAgeAnswer("adult");
                void persistAgeBracket("adult");
                navigate({ to: "/auth/onboarding" });
              }}
            >
              Yes, I am 18+
            </GeoButton>
            <GeoButton
              variant="secondary"
              size="lg"
              onClick={() => {
                setAgeAnswer("minor");
                void persistAgeBracket("minor");
              }}
            >
              No, I'm under 18
            </GeoButton>
          </div>
          <p className="text-center text-[0.68rem] leading-relaxed text-foreground/50">
            By continuing you confirm your answer is accurate. See the{" "}
            <Link to="/terms" className="text-bronze/90 hover:text-bronze">
              Terms of Service
            </Link>{" "}
            for the full eligibility policy.
          </p>
        </div>
      </AuthLayout>
    </PageShell>
  );
}
