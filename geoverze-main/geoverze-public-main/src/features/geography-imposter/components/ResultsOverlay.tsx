import { ArrowLeft, Crown, Loader2, Shield, Trophy, UserX } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { GeoButton } from "@/components/shared";
import type {
  ImpParticipant,
  ImpReveal,
  ImpRoomState,
  ImpVoteStatusReveal,
} from "../types";

type ResultsOverlayProps = {
  roomState: ImpRoomState;
  reveal: ImpReveal;
  voteStatus: ImpVoteStatusReveal;
  myUserId: string;
  isHost: boolean;
  onRestart: () => Promise<void>;
};

export function ResultsOverlay({
  roomState,
  reveal,
  voteStatus,
  myUserId,
  isHost,
  onRestart,
}: ResultsOverlayProps) {
  const navigate = useNavigate();
  const { participants } = roomState;
  const [restarting, setRestarting] = useState(false);

  const getName = (uid: string) =>
    participants.find((p) => p.user_id === uid)?.display_name ?? "Unknown";

  const handleRestart = async () => {
    setRestarting(true);
    try {
      await onRestart();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not restart");
    } finally {
      setRestarting(false);
    }
  };

  const myScore = reveal.scores.find((s) => s.user_id === myUserId);
  const isImposter = myScore?.role === "imposter";
  const iCaught = reveal.imposter_caught;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[oklch(0.10_0.006_60/0.97)] px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Outcome banner */}
        <div
          className={`rounded-2xl p-6 text-center ${
            iCaught
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-red-500/10 border border-red-500/20"
          }`}
        >
          <div
            className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${
              iCaught ? "bg-emerald-500/20" : "bg-red-500/20"
            }`}
          >
            {iCaught ? (
              <Shield className="h-8 w-8 text-emerald-400" strokeWidth={1.6} aria-hidden />
            ) : (
              <UserX className="h-8 w-8 text-red-400" strokeWidth={1.6} aria-hidden />
            )}
          </div>
          <h1
            className={`text-2xl font-bold ${iCaught ? "text-emerald-400" : "text-red-400"}`}
          >
            {iCaught ? "Imposter Caught!" : "Imposter Escaped!"}
          </h1>
          <p className="mt-2 text-[0.84rem] text-foreground/60">
            {iCaught
              ? `The room correctly identified ${getName(reveal.imposter_user_id)} as the imposter.`
              : `${getName(reveal.imposter_user_id)} successfully blended in and escaped detection.`}
          </p>

          {/* Personal outcome */}
          {myScore && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                myScore.total_points > 0
                  ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                  : "border-foreground/10 bg-foreground/[0.04] text-foreground/50"
              }`}
            >
              {isImposter && !iCaught
                ? "🎭 You escaped! +100 points"
                : isImposter && iCaught
                  ? "🕵️ You were caught. Better luck next time!"
                  : myScore.vote_correct
                    ? "✅ You voted correctly! +100 points"
                    : "❌ Wrong vote. No points this round."}
            </div>
          )}
        </div>

        {/* Word reveal */}
        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.04] p-5">
          <h2 className="mb-4 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-foreground/40">
            The Secret Words
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-emerald-400/70">
                Actual word
              </p>
              <p className="mt-1.5 text-[1.1rem] font-bold text-foreground">
                {reveal.actual_word}
              </p>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-red-400/70">
                Imposter's word
              </p>
              <p className="mt-1.5 text-[1.1rem] font-bold text-foreground">
                {reveal.imposter_word}
              </p>
            </div>
          </div>
        </div>

        {/* Vote distribution */}
        {Object.keys(voteStatus.distribution).length > 0 && (
          <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.04] p-5">
            <h2 className="mb-4 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-foreground/40">
              Final Votes
            </h2>
            <div className="space-y-2">
              {participants
                .filter((p) => !p.is_excluded)
                .sort((a, b) => {
                  const va = voteStatus.distribution[a.user_id] ?? 0;
                  const vb = voteStatus.distribution[b.user_id] ?? 0;
                  return vb - va;
                })
                .map((p) => {
                  const votes = voteStatus.distribution[p.user_id] ?? 0;
                  const isImp = p.user_id === reveal.imposter_user_id;
                  const youVotedFor = voteStatus.you_voted_for === p.user_id;
                  return (
                    <div
                      key={p.user_id}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                        isImp
                          ? "bg-red-500/10 border border-red-500/20"
                          : "bg-foreground/[0.03]"
                      }`}
                    >
                      <span className="text-[0.82rem] font-medium flex-1 text-foreground">
                        {p.display_name}
                        {isImp && (
                          <span className="ml-2 text-[0.68rem] font-semibold uppercase text-red-400">
                            imposter
                          </span>
                        )}
                        {youVotedFor && (
                          <span className="ml-2 text-[0.68rem] text-foreground/40">
                            (your vote)
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[0.84rem] font-semibold text-foreground/70">
                        {votes} vote{votes !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.04] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-foreground/40">
            <Trophy className="h-3.5 w-3.5 text-bronze" aria-hidden />
            Scores
          </h2>
          <div className="space-y-2">
            {reveal.scores.map((s, i) => {
              const isMe = s.user_id === myUserId;
              return (
                <div
                  key={s.user_id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    isMe ? "bg-bronze/10 border border-bronze/20" : "bg-foreground/[0.03]"
                  }`}
                >
                  <span
                    className={`w-5 text-center text-[0.78rem] font-bold ${
                      i === 0 ? "text-amber-400" : "text-foreground/30"
                    }`}
                  >
                    {i === 0 ? <Crown className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                  </span>
                  <span className="flex-1 text-[0.84rem] font-medium text-foreground">
                    {getName(s.user_id)}
                    {isMe && <span className="ml-1 text-foreground/40 text-[0.72rem]">(you)</span>}
                    {s.role === "imposter" && (
                      <span className="ml-2 text-[0.68rem] font-semibold uppercase text-red-400">
                        imposter
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {s.total_points} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isHost && (
            <GeoButton
              variant="solid"
              size="lg"
              className="flex-1"
              onClick={() => void handleRestart()}
              disabled={restarting}
            >
              {restarting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                "Play Again"
              )}
            </GeoButton>
          )}
          <GeoButton
            variant="dark"
            size="lg"
            className={isHost ? "flex-1" : "w-full"}
            onClick={() => void navigate({ to: "/play" })}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            Let's Play
          </GeoButton>
        </div>
      </div>
    </div>
  );
}
