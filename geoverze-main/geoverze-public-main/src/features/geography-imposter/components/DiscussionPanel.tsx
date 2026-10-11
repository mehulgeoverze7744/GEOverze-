import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { GeoButton } from "@/components/shared";
import { sendImpMessage } from "../data/impRoomApi";
import type { ImpChatMessage, ImpParticipant, ImpRoom } from "../types";
import { useCountdown } from "./ImpGameHeader";

type DiscussionPanelProps = {
  room: ImpRoom;
  participants: ImpParticipant[];
  chat: ImpChatMessage[];
  myUserId: string;
};

export function DiscussionPanel({ room, participants, chat, myUserId }: DiscussionPanelProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const countdown = useCountdown(room.phase_deadline);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

  const sendMessage = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await sendImpMessage(room.id, body);
      setInput("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSending(false);
    }
  };

  const getName = (uid: string) =>
    participants.find((p) => p.user_id === uid)?.display_name ?? "Unknown";

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Timer bar */}
      <div className="flex items-center justify-between rounded-xl bg-foreground/[0.04] px-4 py-2.5">
        <div className="flex items-center gap-2 text-[0.82rem] font-semibold text-foreground">
          <MessageCircle className="h-4 w-4 text-bronze" strokeWidth={1.9} aria-hidden />
          Discussion — Round {room.current_round}
        </div>
        {countdown !== null && (
          <span
            className={`font-mono font-bold tabular-nums ${
              countdown <= 10 ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {countdown}s left
          </span>
        )}
      </div>

      {/* Instructions */}
      <p className="text-[0.78rem] text-foreground/50 leading-relaxed">
        Discuss the clues. Who gave vague or slightly off clues? The imposter has a{" "}
        <em>related but different</em> word — spot the odd one out!
      </p>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-2 rounded-xl bg-foreground/[0.02] border border-foreground/8 p-3 min-h-0">
        {chat.length === 0 && (
          <p className="text-center text-[0.78rem] text-foreground/30 py-6">
            No messages yet. Start the discussion!
          </p>
        )}
        {chat.map((msg) => {
          const isMe = msg.user_id === myUserId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              {!isMe && (
                <span className="text-[0.68rem] font-medium text-foreground/40 px-1 mb-0.5">
                  {getName(msg.user_id)}
                </span>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[0.84rem] leading-snug ${
                  isMe
                    ? "bg-bronze/20 text-foreground rounded-tr-sm"
                    : "bg-foreground/[0.08] text-foreground/90 rounded-tl-sm"
                }`}
              >
                {msg.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-foreground/15 bg-background px-3 py-2 text-sm placeholder:text-foreground/30 focus:border-bronze/50 focus:outline-none"
          placeholder="Type a message…"
          maxLength={200}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void sendMessage();
          }}
          disabled={sending}
        />
        <GeoButton
          variant="solid"
          size="md"
          onClick={() => void sendMessage()}
          disabled={!input.trim() || sending}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" strokeWidth={1.9} aria-hidden />
        </GeoButton>
      </div>
    </div>
  );
}
