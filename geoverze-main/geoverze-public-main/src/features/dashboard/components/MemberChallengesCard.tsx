import { Flag, Lock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MembershipUpgradePrompt } from "@/features/pricing/components/MembershipUpgradePrompt";
import {
  completeMembershipChallenge,
  fetchMembershipChallenges,
  joinMembershipChallenge,
  membershipChallengesQueryKey,
} from "@/features/pricing/data/fetchMembershipChallenges";
import { useMyMembership } from "@/features/pricing/hooks/useMyMembership";
import { GeoButton } from "@/components/shared";
import { cn } from "@/lib/utils";
import { selectUser, useAuthStore } from "@/stores/authStore";

function formatWindow(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, {
    ...opts,
    year: "numeric",
  })}`;
}

/** Pro member-only challenges with join / complete tracking. Rewards stay admin-configured. */
export function MemberChallengesCard({ className }: { className?: string }) {
  const user = useAuthStore(selectUser);
  const { membership } = useMyMembership();
  const eligible = Boolean(membership?.memberChallenges);
  const queryClient = useQueryClient();
  const queryKey = membershipChallengesQueryKey(user?.id);

  const { data: challenges = [], isPending } = useQuery({
    queryKey,
    queryFn: fetchMembershipChallenges,
    enabled: Boolean(user?.id) && eligible,
    staleTime: 30_000,
  });

  const joinMutation = useMutation({
    mutationFn: joinMembershipChallenge,
    onSuccess: () => {
      toast.success("Challenge joined");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const completeMutation = useMutation({
    mutationFn: completeMembershipChallenge,
    onSuccess: (result) => {
      const pending =
        result &&
        typeof result === "object" &&
        "reward_pending_configuration" in result &&
        Boolean((result as { reward_pending_configuration?: boolean }).reward_pending_configuration);
      toast.success(
        pending
          ? "Challenge completed. No credits were awarded — rewards stay admin-configured."
          : "Challenge completed",
      );
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <section
      className={cn("dashboard-subscription", className)}
      aria-labelledby="member-challenges-heading"
    >
      <h2 id="member-challenges-heading" className="dashboard-section-label dashboard-subscription-title">
        <Flag className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        Member-only challenges
      </h2>

      {!eligible ? (
        <MembershipUpgradePrompt
          requiredTier="pro"
          title="Pro challenges"
          description="Exclusive timed challenges are included with Pro. Join, complete, and keep a history of every circuit."
          className="mt-4"
        />
      ) : isPending ? (
        <p className="mt-4 text-sm text-foreground/55">Loading challenges…</p>
      ) : challenges.length === 0 ? (
        <p className="mt-4 text-sm text-foreground/55">
          No published challenges in this window. Check back after the next admin drop.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {challenges.map((challenge) => {
            const joined = challenge.participation?.status === "joined";
            const completed = challenge.participation?.status === "completed";
            const now = Date.now();
            const active =
              now >= new Date(challenge.starts_at).getTime() &&
              now <= new Date(challenge.ends_at).getTime();
            return (
              <li
                key={challenge.id}
                className="rounded-2xl border border-bronze/20 bg-charcoal/25 p-4"
              >
                <p className="text-[0.58rem] uppercase tracking-[0.2em] text-bronze/85">
                  {formatWindow(challenge.starts_at, challenge.ends_at)}
                </p>
                <h3 className="mt-2 text-base font-semibold text-foreground">{challenge.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">{challenge.description}</p>
                <p className="mt-2 text-xs text-foreground/45">
                  {completed
                    ? "Completed"
                    : joined
                      ? "Joined"
                      : active
                        ? "Open"
                        : "Outside window"}
                  {challenge.reward_credits > 0
                    ? ` · ${challenge.reward_credits} credit reward`
                    : " · Reward pending admin configuration"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!joined && !completed ? (
                    <GeoButton
                      size="sm"
                      disabled={!active || joinMutation.isPending}
                      onClick={() => joinMutation.mutate(challenge.id)}
                    >
                      Join
                    </GeoButton>
                  ) : null}
                  {joined && !completed ? (
                    <GeoButton
                      size="sm"
                      disabled={!active || completeMutation.isPending}
                      onClick={() => completeMutation.mutate(challenge.id)}
                    >
                      Mark complete
                    </GeoButton>
                  ) : null}
                  {completed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-foreground/50">
                      <Lock className="h-3 w-3" strokeWidth={1.6} aria-hidden />
                      In your challenge history
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
