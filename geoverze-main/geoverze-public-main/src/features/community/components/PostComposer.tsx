import { Image as ImageIcon, HelpCircle, BarChart3, Trophy, Type, X, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { GeoButton, GeoInput, GeoTextarea } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { cn } from "@/lib/utils";

import { CURRENT_HANDLE } from "../data/members";
import { MemberAvatar } from "./MemberAvatar";

type Mode = "text" | "image" | "question" | "poll" | "achievement";

const MODES: readonly { id: Mode; label: string; icon: typeof Type }[] = [
  { id: "text", label: "Post", icon: Type },
  { id: "image", label: "Photo", icon: ImageIcon },
  { id: "question", label: "Question", icon: HelpCircle },
  { id: "poll", label: "Poll", icon: BarChart3 },
  { id: "achievement", label: "Achievement", icon: Trophy },
];

const PLACEHOLDER: Record<Mode, string> = {
  text: "Share something you learned about the world…",
  image: "Describe the photo — where was it, and why does it matter?",
  question: "Ask the community a geography question…",
  poll: "Add context for your poll…",
  achievement: "Say something about the badge you unlocked…",
};

/**
 * Post composer. Presentation only: submitting confirms with a toast rather
 * than persisting, since no backend exists yet.
 */
export function PostComposer() {
  const [mode, setMode] = useState<Mode>("text");
  const [body, setBody] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [topics, setTopics] = useState("");

  const needsQuestion = mode === "question" || mode === "poll";
  const canSubmit = body.trim().length > 0 && (!needsQuestion || question.trim().length > 0);

  const reset = () => {
    setBody("");
    setQuestion("");
    setOptions(["", ""]);
    setTopics("");
  };

  return (
    <GameCard interactive={false} className="p-6">
      <div className="flex items-start gap-3">
        <MemberAvatar handle={CURRENT_HANDLE} size="md" linked={false} />
        <div className="min-w-0 flex-1">
          <ul className="flex flex-wrap gap-1.5">
            {MODES.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setMode(m.id)}
                  aria-pressed={mode === m.id}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.14em] transition-[color,border-color,transform] motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 active:scale-[0.97]",
                    mode === m.id
                      ? "border-bronze/55 bg-bronze/10 text-bronze-glow"
                      : "border-bronze/15 text-foreground/50 hover:border-bronze/40 hover:text-foreground/80",
                  )}
                >
                  <m.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {m.label}
                </button>
              </li>
            ))}
          </ul>

          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Post ready", {
                description: "Publishing arrives when the community backend goes live.",
              });
              reset();
            }}
          >
            {needsQuestion ? (
              <GeoInput
                id="composer-question"
                label={mode === "poll" ? "Poll question" : "Your question"}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  mode === "poll"
                    ? "Hardest quiz category in GEOverze?"
                    : "Which country has the most time zones?"
                }
              />
            ) : null}

            <GeoTextarea
              id="composer-body"
              label={mode === "poll" ? "Context" : "Message"}
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={PLACEHOLDER[mode]}
            />

            {mode === "poll" ? (
              <div className="space-y-2">
                {options.map((option, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
                    <GeoInput
                      id={`composer-option-${i}`}
                      label={`Option ${i + 1}`}
                      value={option}
                      onChange={(e) =>
                        setOptions((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                      }
                    />
                    {options.length > 2 ? (
                      <button
                        type="button"
                        aria-label={`Remove option ${i + 1}`}
                        onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                        className="mb-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-bronze/20 text-foreground/50 transition-colors hover:border-bronze/45 hover:text-bronze"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    ) : null}
                  </div>
                ))}
                {options.length < 5 ? (
                  <GeoButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOptions((prev) => [...prev, ""])}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Add option
                  </GeoButton>
                ) : null}
              </div>
            ) : null}

            {mode === "image" ? (
              <div className="rounded-xl border border-dashed border-bronze/25 bg-charcoal/40 px-5 py-8 text-center">
                <ImageIcon className="mx-auto h-5 w-5 text-bronze/90" strokeWidth={1.4} />
                <p className="mt-3 text-sm text-foreground/60">
                  Image upload arrives with the backend
                </p>
                <p className="mt-1 text-[0.68rem] text-foreground/50">
                  For now, describe the location in your message.
                </p>
              </div>
            ) : null}

            <GeoInput
              id="composer-topics"
              label="Topics"
              hint="Comma separated, e.g. rivers, europe"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
            />

            <div className="flex flex-wrap items-center gap-2">
              <GeoButton type="submit" variant="solid" size="sm" disabled={!canSubmit}>
                Publish
              </GeoButton>
              <GeoButton type="button" variant="ghost" size="sm" onClick={reset}>
                Clear
              </GeoButton>
              <p className="ml-auto text-[0.65rem] text-foreground/50">{body.trim().length}/600</p>
            </div>
          </form>
        </div>
      </div>
    </GameCard>
  );
}
