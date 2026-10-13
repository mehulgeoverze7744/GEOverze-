import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { SessionHero } from "@/features/play/components/SessionHero";
import { thumbnailForGameType } from "@/features/play/data/sessionArtwork";
import {
  DRAW_CATEGORY_OPTIONS,
  DRAW_DEFAULT_TURN_SECONDS,
  DRAW_DIFFICULTY_OPTIONS,
  DRAW_MAX_PLAYER_OPTIONS,
  DRAW_MAX_TURN_SECONDS,
  DRAW_MIN_TURN_SECONDS,
  DRAW_ROUND_OPTIONS,
} from "../data/categories";
import { createDrawRoom } from "../data/drawRoomApi";
import type { DrawCategory } from "../types";

import { cn } from "@/lib/utils";

export function DrawGuessCreateScreen() {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<1 | 3 | 5>(3);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [categories, setCategories] = useState<DrawCategory[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [turnSeconds, setTurnSeconds] = useState(DRAW_DEFAULT_TURN_SECONDS);
  const [creating, setCreating] = useState(false);

  const toggleCategory = (cat: DrawCategory) => {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const state = await createDrawRoom({
        rounds,
        maxPlayers,
        categories,
        difficulty,
        turnSeconds,
      });
      void navigate({
        to: "/play/draw-guess/room",
        search: { room: state.room.id, code: state.room.room_code },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create room");
    } finally {
      setCreating(false);
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
            to="/play/draw-guess"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Draw &amp; Guess hub
          </Link>
          <div className="mt-5 overflow-hidden rounded-2xl border border-bronze/15">
            <SessionHero thumbnail={thumbnailForGameType("draw-guess")} className="h-36 sm:h-44" />
          </div>
          <MetaChip tone="bronze" className="mt-5">
            Create room
          </MetaChip>
          <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-foreground">
            Configure your game
          </h1>
          <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-foreground/60">
            Pick your settings, then share the room code with friends.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Rounds */}
            <section aria-labelledby="rounds-label">
              <p
                id="rounds-label"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-foreground/50"
              >
                Rounds
              </p>
              <div className="mt-3 flex gap-2">
                {DRAW_ROUND_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={rounds === r}
                    onClick={() => setRounds(r)}
                    className={cn(
                      "flex-1 rounded-xl border py-3 text-[0.88rem] font-semibold transition-all",
                      rounds === r
                        ? "border-bronze bg-bronze/20 text-bronze-glow"
                        : "border-bronze/25 bg-[oklch(0.185_0.008_62)] text-foreground/60 hover:border-bronze/50",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </section>

            {/* Max players */}
            <section aria-labelledby="players-label">
              <p
                id="players-label"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-foreground/50"
              >
                Max players
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DRAW_MAX_PLAYER_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={maxPlayers === n}
                    onClick={() => setMaxPlayers(n)}
                    className={cn(
                      "h-10 w-10 rounded-xl border text-[0.85rem] font-semibold transition-all",
                      maxPlayers === n
                        ? "border-bronze bg-bronze/20 text-bronze-glow"
                        : "border-bronze/25 bg-[oklch(0.185_0.008_62)] text-foreground/60 hover:border-bronze/50",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </section>

            {/* Difficulty */}
            <section aria-labelledby="difficulty-label">
              <p
                id="difficulty-label"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-foreground/50"
              >
                Difficulty
              </p>
              <div className="mt-3 flex gap-2">
                {DRAW_DIFFICULTY_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={difficulty === d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={cn(
                      "flex-1 rounded-xl border py-3 text-[0.82rem] font-semibold capitalize transition-all",
                      difficulty === d.id
                        ? "border-bronze bg-bronze/20 text-bronze-glow"
                        : "border-bronze/25 bg-[oklch(0.185_0.008_62)] text-foreground/60 hover:border-bronze/50",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Turn seconds */}
            <section aria-labelledby="turn-secs-label">
              <p
                id="turn-secs-label"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-foreground/50"
              >
                Drawing time per turn — <span className="text-foreground">{turnSeconds}s</span>
              </p>
              <input
                type="range"
                min={DRAW_MIN_TURN_SECONDS}
                max={DRAW_MAX_TURN_SECONDS}
                step={10}
                value={turnSeconds}
                onChange={(e) => setTurnSeconds(Number(e.target.value))}
                className="mt-3 w-full accent-bronze"
                aria-label="Drawing time per turn in seconds"
              />
              <div className="mt-1 flex justify-between text-[0.68rem] text-foreground/40">
                <span>{DRAW_MIN_TURN_SECONDS}s</span>
                <span>{DRAW_MAX_TURN_SECONDS}s</span>
              </div>
            </section>
          </div>

          {/* Right column — categories */}
          <section aria-labelledby="categories-label">
            <p
              id="categories-label"
              className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-foreground/50"
            >
              Word categories{" "}
              <span className="font-normal text-foreground/40">(leave blank for all)</span>
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {DRAW_CATEGORY_OPTIONS.map((cat) => {
                const on = categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left text-[0.8rem] font-medium transition-all",
                      on
                        ? "border-bronze bg-bronze/15 text-foreground"
                        : "border-bronze/20 bg-[oklch(0.185_0.008_62)] text-foreground/60 hover:border-bronze/45",
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
            {categories.length === 0 ? (
              <p className="mt-2 text-[0.72rem] text-bronze/70">
                No selection = Mixed categories (all available words).
              </p>
            ) : null}
          </section>
        </AnimatedSection>

        <AnimatedSection className="mt-10">
          <GeoButton
            variant="solid"
            size="lg"
            className="w-full sm:w-auto"
            disabled={creating}
            onClick={() => void handleCreate()}
          >
            {creating ? "Creating room…" : "Create room"}
          </GeoButton>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
