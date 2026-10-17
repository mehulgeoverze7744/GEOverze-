import { Bookmark, Clock, Globe2, HelpCircle, Share2, Sparkles, Trophy, Flame } from "lucide-react";
import { useState } from "react";

import { GeoButton } from "@/components/shared";
import { DifficultyBadge, MetaChip } from "@/features/play/components/Badges";
import { CoverArt } from "@/features/play/components/CoverArt";
import { QUIZ_CATEGORIES } from "@/features/play/data/categories";
import { coverFromThumbnail, thumbnailForQuizSession } from "@/features/play/data/sessionArtwork";
import { cn } from "@/lib/utils";
import { useBookmarksStore } from "@/stores/bookmarksStore";
import type { QuestionType, QuizSet } from "../data/types";
import { SettingsPanel } from "./SettingsPanel";

const ICONS = new Map(QUIZ_CATEGORIES.map((c) => [c.id, c.icon]));
const TITLES = new Map(QUIZ_CATEGORIES.map((c) => [c.id, c.title]));

const FORMAT_LABEL: Record<QuestionType, string> = {
  single: "Single Choice",
  multiple: "Multiple Choice",
  boolean: "True or False",
  typed: "Type the Answer",
  dragdrop: "Drag and Drop",
  order: "Arrange in Order",
  image: "Image Selection",
  map: "Map Selection",
};

function lobbyCardClass(className?: string) {
  return cn(
    "min-w-0 overflow-hidden rounded-[1.5rem] border border-white/8 bg-[oklch(0.145_0.008_60/0.78)] shadow-[0_12px_40px_oklch(0_0_0/0.28)] backdrop-blur-xl",
    className,
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[1.15rem] border border-white/6 bg-[oklch(0.2_0.01_60/0.45)] px-4 py-3.5">
      <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground/45">
        <Icon className="h-3.5 w-3.5 shrink-0 text-bronze" strokeWidth={1.8} aria-hidden />
        <span className="min-w-0 truncate">{label}</span>
      </p>
      <p className="mt-1.5 text-[1.05rem] font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

/** Pre-quiz lobby: everything a player needs before committing to a run. */
export function QuizLobby({ set, onStart }: { set: QuizSet; onStart: () => void }) {
  const bookmarkIds = useBookmarksStore((s) => s.ids);
  const toggleBookmark = useBookmarksStore((s) => s.toggle);
  const [shared, setShared] = useState(false);
  const bookmarked = bookmarkIds.includes(set.id);

  const share = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch {
      setShared(false);
    }
  };

  const Icon = ICONS.get(set.categoryId);
  const thumbnail = thumbnailForQuizSession(set.id);
  const types = [...new Set(set.questions.map((q) => q.type))].map((type) => FORMAT_LABEL[type]);

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,22.5rem)] lg:gap-8">
      <article className={lobbyCardClass()}>
        <CoverArt
          art={set.art}
          ratio="wide"
          className="h-48 sm:h-60 md:h-64"
          {...(thumbnail ? coverFromThumbnail(thumbnail) : { icon: Icon })}
        />
        <div className="p-6 sm:p-8">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <DifficultyBadge level={set.difficulty} />
            <MetaChip tone="bronze">{TITLES.get(set.categoryId) ?? "Geography"}</MetaChip>
            <MetaChip>
              <Globe2 className="h-3 w-3" aria-hidden />
              {set.language}
            </MetaChip>
          </div>

          <h1 className="mt-5 text-[1.75rem] font-semibold tracking-tight text-foreground sm:text-4xl">
            {set.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-foreground/60">
            {set.description}
          </p>
          <p className="mt-3 text-[0.8rem] text-foreground/50">
            Created by <span className="font-medium text-bronze-glow">{set.creator}</span>
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Fact icon={HelpCircle} label="Questions" value={`${set.questions.length}`} />
            <Fact icon={Clock} label="Estimated time" value={`${set.minutes} min`} />
            <Fact icon={Sparkles} label="Formats" value={`${types.length} types`} />
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <GeoButton
              variant="solid"
              size="lg"
              onClick={onStart}
              className="w-full px-10 sm:w-auto sm:min-w-[12.5rem]"
            >
              Start quiz
            </GeoButton>
            <GeoButton
              variant="dark"
              size="lg"
              onClick={() => toggleBookmark(set.id)}
              aria-pressed={bookmarked}
              className="w-full sm:w-auto"
            >
              <Bookmark
                className="h-4 w-4"
                strokeWidth={1.9}
                fill={bookmarked ? "currentColor" : "none"}
                aria-hidden
              />
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </GeoButton>
            <GeoButton variant="ghost" size="lg" onClick={share} className="w-full sm:w-auto">
              <Share2 className="h-4 w-4" strokeWidth={1.9} aria-hidden />
              {shared ? "Link copied" : "Share"}
            </GeoButton>
          </div>
          <p aria-live="polite" className="sr-only">
            {shared ? "Quiz link copied to clipboard" : ""}
          </p>

          <ul className="mt-7 flex min-w-0 flex-wrap gap-2">
            {types.map((type) => (
              <li key={type}>
                <span className="inline-flex rounded-full border border-white/8 bg-[oklch(0.2_0.01_60/0.4)] px-3 py-1.5 text-[0.7rem] font-medium text-foreground/70">
                  {type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </article>

      <aside className="flex min-w-0 flex-col gap-5">
        <section className={lobbyCardClass("p-6 sm:p-7")} aria-label="Your record">
          <h2 className="text-[1.05rem] font-semibold tracking-tight text-foreground">
            Your record
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Fact
              icon={Trophy}
              label="High score"
              value={`${set.highScore}/${set.questions.length}`}
            />
            <Fact icon={Flame} label="Best streak" value={`${set.bestStreak}`} />
          </div>
          <h3 className="mt-7 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground/45">
            Completion rewards
          </h3>
          <div className="mt-3 flex min-w-0 flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-bronze/30 bg-bronze/12 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-bronze-glow">
              +{set.rewards.xp} XP
            </span>
            <span className="inline-flex rounded-full border border-bronze/30 bg-bronze/12 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-bronze-glow">
              +{set.rewards.credits} credits
            </span>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-foreground/70">
              Streak shield
            </span>
          </div>
          <p className="mt-4 text-[0.75rem] leading-relaxed text-foreground/50">
            XP and credits from completed quizzes are recorded on your account when signed in.
          </p>
        </section>

        <SettingsPanel />
      </aside>
    </div>
  );
}
