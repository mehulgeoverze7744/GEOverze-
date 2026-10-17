import { ArrowLeft, Loader2, Settings } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { SessionHero } from "@/features/play/components/SessionHero";
import { thumbnailForGameType } from "@/features/play/data/sessionArtwork";
import { createImpRoom } from "../data/impRoomApi";
import {
  DEFAULT_IMP_CAPACITY,
  IMP_CAPACITY_OPTIONS,
  IMP_CATEGORIES,
  IMP_DIFFICULTIES,
  type ImpCapacity,
  type ImpDifficulty,
  type ImpWordCategory,
} from "../types";

export function ImposterCreateScreen() {
  const navigate = useNavigate();
  const [maxPlayers, setMaxPlayers] = useState<ImpCapacity>(DEFAULT_IMP_CAPACITY);
  const [category, setCategory] = useState<ImpWordCategory | null>(null);
  const [difficulty, setDifficulty] = useState<ImpDifficulty>("medium");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const state = await createImpRoom(maxPlayers, category, difficulty);
      void navigate({
        to: "/play/imposter/room",
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
        size="narrow"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/imposter"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Back
          </Link>
          <div className="mt-5 overflow-hidden rounded-2xl border border-bronze/15">
            <SessionHero
              thumbnail={thumbnailForGameType("geography-imposter")}
              className="h-36 sm:h-44"
            />
          </div>
          <MetaChip tone="bronze" className="mt-5">
            Create room
          </MetaChip>
          <h1 className="mt-4 text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold tracking-tight text-foreground">
            Room Settings
          </h1>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-foreground/60">
            Configure your GEOsus room. You will receive a shareable code after creation.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-8 space-y-5">
          {/* Max players */}
          <div className="rounded-2xl game-surface p-5">
            <h2 className="flex items-center gap-2 text-[0.92rem] font-semibold text-foreground">
              <Settings className="h-4 w-4 text-bronze" strokeWidth={1.9} aria-hidden />
              Max players
            </h2>
            <p className="mt-1.5 text-[0.78rem] text-foreground/55">Minimum 3 · Maximum 16</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {IMP_CAPACITY_OPTIONS.map((n) => (
                <GeoButton
                  key={n}
                  variant={maxPlayers === n ? "solid" : "dark"}
                  size="sm"
                  onClick={() => setMaxPlayers(n)}
                >
                  {n}
                </GeoButton>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="rounded-2xl game-surface p-5">
            <h2 className="text-[0.92rem] font-semibold text-foreground">Difficulty</h2>
            <p className="mt-1.5 text-[0.78rem] text-foreground/55">
              Controls how similar the imposter's word will be to the real word.
            </p>
            <div className="mt-3 flex gap-2">
              {IMP_DIFFICULTIES.map((d) => (
                <GeoButton
                  key={d.value}
                  variant={difficulty === d.value ? "solid" : "dark"}
                  size="sm"
                  onClick={() => setDifficulty(d.value)}
                >
                  {d.label}
                </GeoButton>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="rounded-2xl game-surface p-5">
            <h2 className="text-[0.92rem] font-semibold text-foreground">Category</h2>
            <p className="mt-1.5 text-[0.78rem] text-foreground/55">
              Leave on Mixed to draw from all geography topics.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {IMP_CATEGORIES.map((cat) => (
                <button
                  key={String(cat.value)}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[0.78rem] text-left transition-all ${
                    category === cat.value
                      ? "border-bronze/50 bg-bronze/10 text-foreground"
                      : "border-foreground/10 bg-foreground/[0.03] text-foreground/65 hover:border-foreground/20"
                  }`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-6">
          <GeoButton
            variant="solid"
            size="xl"
            className="w-full"
            onClick={() => void handleCreate()}
            disabled={creating}
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Creating room…
              </>
            ) : (
              "Create Room"
            )}
          </GeoButton>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
