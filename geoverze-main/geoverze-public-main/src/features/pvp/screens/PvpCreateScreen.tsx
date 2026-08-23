import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  SectionContainer,
  SkeletonBlock,
} from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { QuizCard } from "@/features/play/components/QuizCard";
import { usePublishedQuizzes } from "@/features/play/hooks/usePublishedQuizzes";
import { createPvpRoom } from "../data/pvpRoomApi";

/** /play/pvp/create — pick a quiz and create a private room. */
export function PvpCreateScreen() {
  const navigate = useNavigate();
  const { quizzes, loading, error, refetch } = usePublishedQuizzes();
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const createRoom = async (quizId: string) => {
    setCreatingId(quizId);
    try {
      const state = await createPvpRoom(quizId);
      navigate({
        to: "/play/pvp/room",
        search: { room: state.room.id, code: state.room.room_code },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create room");
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/pvp"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Back
          </Link>
          <MetaChip tone="bronze" className="mt-5">
            Create PvP room
          </MetaChip>
          <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.7rem)] font-semibold tracking-tight text-foreground">
            Choose a quiz
          </h1>
          <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-foreground/60">
            Pick the set both players will run. You will receive a room code to share after
            creation.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-10">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Could not load quizzes"
              description={error}
              action={
                <GeoButton variant="solid" size="md" onClick={() => void refetch()}>
                  Try again
                </GeoButton>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="relative">
                <QuizCard
                  quiz={quiz}
                  bookmarked={false}
                  onToggleBookmark={() => {}}
                  onPlay={(selected) => void createRoom(selected.id)}
                />
                  {creatingId === quiz.id ? (
                    <div className="absolute inset-0 grid place-items-center rounded-2xl bg-[oklch(0.12_0.006_60/0.72)]">
                      <Loader2 className="h-6 w-6 animate-spin text-bronze" aria-hidden />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
