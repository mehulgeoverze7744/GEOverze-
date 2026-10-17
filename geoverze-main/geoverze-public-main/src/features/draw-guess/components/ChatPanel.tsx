import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { sendDrawMessage } from "../data/drawRoomApi";
import type { DrawEvent, DrawParticipant, DrawRoomState } from "../types";

function formatHint(hint: string | null | undefined, wordLength: number | null | undefined) {
  if (!hint) {
    if (wordLength) return Array.from({ length: wordLength }, () => "_").join(" ");
    return null;
  }
  return hint;
}

type EventRowProps = {
  event: DrawEvent;
  participants: DrawParticipant[];
};

function EventRow({ event, participants }: EventRowProps) {
  const nameOf = (id: string | null | undefined) =>
    participants.find((p) => p.user_id === id)?.display_name || "A player";

  switch (event.type) {
    case "chat":
      return (
        <div className="flex gap-2">
          <span className="min-w-0 max-w-[110px] flex-shrink-0 truncate text-[0.72rem] font-semibold text-bronze-glow/90">
            {nameOf(event.user_id)}:
          </span>
          <span className="min-w-0 break-words text-[0.78rem] text-foreground/80">
            {event.body}
          </span>
        </div>
      );

    case "guess_correct": {
      const pts = (event.payload?.["points"] as number | undefined) ?? 0;
      return (
        <div className="rounded-lg bg-green-500/10 px-3 py-1.5 text-[0.75rem] text-green-400">
          <span className="font-semibold">{nameOf(event.user_id)}</span> has guessed correctly!
          {pts > 0 ? <span className="ml-1 text-green-300">+{pts} pts</span> : null}
        </div>
      );
    }

    case "system": {
      const kind = event.payload?.["kind"] as string | undefined;
      const messages: Record<string, string> = {
        player_joined: `${nameOf(event.user_id)} joined the room.`,
        player_left: `${nameOf(event.user_id)} left the room.`,
        host_changed: `${nameOf(event.user_id)} is now the host.`,
        word_chosen: "The drawer has chosen a word. Guess it!",
        word_auto_chosen: "Time ran out — a word was chosen automatically.",
        drawer_turn_start: `${nameOf(event.payload?.["drawer_user_id"] as string | undefined)} is drawing!`,
        game_restarted: "The game has been restarted. Ready up!",
      };
      const text = messages[kind ?? ""] || kind || "—";
      return <div className="text-[0.72rem] italic text-foreground/45">{text}</div>;
    }

    case "turn_result": {
      const word = event.payload?.["word"] as string | null | undefined;
      const skipped = event.payload?.["skipped"] as boolean | undefined;
      const drawer = nameOf(event.payload?.["drawer_user_id"] as string | undefined);
      const pts = event.payload?.["drawer_points"] as number | undefined;
      if (skipped) {
        return (
          <div className="rounded-lg border border-bronze/15 bg-bronze/5 px-3 py-1.5 text-[0.75rem] text-foreground/55">
            {drawer} skipped their turn.
          </div>
        );
      }
      return (
        <div className="rounded-lg border border-bronze/25 bg-bronze/8 px-3 py-2 text-[0.75rem]">
          <p className="font-semibold text-bronze">
            The word was: <span className="text-foreground">{word ?? "?"}</span>
          </p>
          {pts != null ? (
            <p className="mt-0.5 text-foreground/60">
              {drawer} earned <span className="text-bronze-glow">{pts} pts</span>
            </p>
          ) : null}
        </div>
      );
    }

    case "round_result": {
      const num = event.payload?.["round_number"] as number | undefined;
      return (
        <div className="my-1 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-bronze/60">
          — Round {num} complete —
        </div>
      );
    }

    default:
      return null;
  }
}

type ChatPanelProps = {
  state: DrawRoomState;
  myUserId: string | undefined;
  isDrawer: boolean;
};

export function ChatPanel({ state, myUserId, isDrawer }: ChatPanelProps) {
  const { room, participants, current_turn: turn, events } = state;
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  const alreadyGuessed =
    !isDrawer && turn != null && turn.correct_user_ids.includes(myUserId ?? "");

  const hint = turn?.status === "drawing" ? formatHint(turn.hint, turn.word_length) : null;

  useEffect(() => {
    const el = listRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [events]);

  const submit = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    const text = message.trim();
    setMessage("");
    try {
      const result = await sendDrawMessage(room.id, text);
      if (result.correct) {
        // Local positive feedback — the server already wrote a guess_correct event
        // which will arrive via realtime refresh and display in the chat stream.
      }
    } catch {
      // silent — rate limit or other transient error; message lost, that's OK.
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full max-lg:h-auto flex-col gap-0 overflow-hidden rounded-2xl border border-bronze/25 bg-[oklch(0.12_0.006_60/0.7)]">
      {/* Hint bar */}
      {hint ? (
        <div className="border-b border-bronze/15 px-4 py-2.5 text-center">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-foreground/40">
            Hint
          </p>
          <p className="mt-0.5 font-mono text-[1.05rem] font-semibold tracking-[0.32em] text-foreground/90">
            {hint}
          </p>
        </div>
      ) : turn?.status === "choosing" ? (
        <div className="border-b border-bronze/15 px-4 py-2.5 text-center text-[0.78rem] italic text-foreground/40">
          Drawer is choosing a word…
        </div>
      ) : null}

      {/* Events/chat list */}
      <div
        ref={listRef}
        className="min-h-[12rem] flex-1 overflow-y-auto overscroll-contain px-3 py-3 max-lg:max-h-[min(42vh,20rem)]"
        role="log"
        aria-live="polite"
        aria-label="Chat and game events"
        onScroll={(event) => {
          const el = event.currentTarget;
          stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
        }}
      >
        <div className="flex flex-col gap-1.5">
          {events.map((event) => (
            <EventRow key={event.id} event={event} participants={participants} />
          ))}
        </div>
      </div>

      {/* Drawer's word reminder */}
      {isDrawer && turn?.secret_word ? (
        <div className="border-t border-bronze/15 px-4 py-2 text-center text-[0.72rem] text-foreground/55">
          Drawing: <span className="font-semibold text-foreground">{turn.secret_word}</span>
          &nbsp;·&nbsp;
          <span className="text-green-400">{turn.correct_user_ids.length}</span> correct so far
        </div>
      ) : null}

      {/* Guess input — pinned to bottom */}
      <div className="border-t border-bronze/20 p-3">
        {alreadyGuessed ? (
          <p className="text-center text-[0.75rem] font-semibold text-green-400">
            ✓ You guessed it! You can still chat.
          </p>
        ) : null}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={
              isDrawer
                ? "Chat with players…"
                : alreadyGuessed
                  ? "Chat (you already guessed)…"
                  : "Type your guess…"
            }
            className={cn(
              "min-w-0 flex-1 rounded-xl border border-bronze/20 bg-[oklch(0.185_0.008_62)] px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-bronze sm:py-2.5 sm:text-[0.82rem]",
              alreadyGuessed ? "opacity-70" : "",
            )}
            aria-label={isDrawer ? "Chat message" : "Guess or chat"}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="flex-shrink-0 rounded-xl border border-bronze/40 bg-bronze/15 px-4 py-2.5 text-[0.78rem] font-semibold text-bronze transition-all hover:bg-bronze/25 disabled:opacity-40"
          >
            {isDrawer ? "Send" : "Guess"}
          </button>
        </form>
      </div>
    </div>
  );
}
