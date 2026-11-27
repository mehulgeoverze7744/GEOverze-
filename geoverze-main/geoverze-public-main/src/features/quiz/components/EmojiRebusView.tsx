import { cn } from "@/lib/utils";

import { parseEmojiRebusTokens } from "../lib/emojiMedia";
import { QuizImage } from "./QuizImage";

function isEmojiToken(token: string): boolean {
  return /[^\u0000-\u007f]/.test(token);
}

export function EmojiRebusView({
  glyph,
  caption,
  supportingImageSrc,
  className,
}: {
  glyph: string;
  caption?: string;
  /** Thematic quiz art — must not replace the emoji clue sequence. */
  supportingImageSrc?: string | null;
  className?: string;
}) {
  const tokens = parseEmojiRebusTokens(glyph);

  return (
    <figure className={cn("mx-auto w-full max-w-3xl space-y-4", className)}>
      <div
        className="flex min-h-[10rem] w-full flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#E2E8F0] bg-gradient-to-b from-[#FAFCFF] to-[#F1F5F9] px-4 py-8 sm:gap-4 sm:px-8"
        role="img"
        aria-label={caption ?? "Emoji rebus clue"}
      >
        {tokens.map((token, index) => (
          <span key={`${token}-${index}`} className="inline-flex items-center gap-3">
            {index > 0 ? (
              <span className="select-none text-xl font-semibold text-[#94A3B8] sm:text-2xl" aria-hidden>
                +
              </span>
            ) : null}
            <span
              className={cn(
                "rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm",
                isEmojiToken(token)
                  ? "text-[2.35rem] leading-none sm:text-[2.75rem]"
                  : "text-[1.05rem] font-bold uppercase tracking-[0.12em] text-[#1e293b] sm:text-[1.15rem]",
              )}
              style={{ fontFamily: isEmojiToken(token) ? "var(--font-emoji, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif)" : undefined }}
            >
              {token}
            </span>
          </span>
        ))}
      </div>
      {caption ? (
        <figcaption className="text-center text-[0.75rem] leading-relaxed text-[#64748B]">
          {caption}
        </figcaption>
      ) : null}
      {supportingImageSrc ? (
        <QuizImage
          src={supportingImageSrc}
          alt=""
          className="opacity-[0.92]"
          imgClassName="max-h-[12rem] object-cover"
        />
      ) : null}
    </figure>
  );
}