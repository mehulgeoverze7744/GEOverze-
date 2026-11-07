import { Music, Video } from "lucide-react";

import { FlagTile, QuizImage } from "./QuizImage";
import type { QuestionMedia } from "../data/types";
import { resolveMapBoard } from "../lib/mapBoards";

/**
 * Renders the media attached to a question card.
 *
 * Flags, photographs, illustrations and maps use real images. Audio and video
 * clues keep a labelled surface until a media file is attached.
 */
export function QuestionMediaView({ media }: { media: QuestionMedia }) {
  if (media.kind === "flag") {
    return (
      <QuizImage
        src={"art" in media ? media.art : undefined}
        alt={media.caption ?? "National flag"}
        caption={media.caption}
        flagHint={{ glyph: media.glyph, art: "art" in media ? media.art : undefined }}
        className="mx-auto max-w-lg"
        imgClassName="max-h-[18rem] object-contain p-4 sm:max-h-[22rem]"
      />
    );
  }

  if (media.kind === "audio" || media.kind === "video") {
    const Icon = media.kind === "audio" ? Music : Video;
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-5">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#2b74c4]">
          <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden />
        </span>
        <div>
          <p className="text-[0.85rem] font-semibold text-[#111827]">
            {media.kind === "audio" ? "Audio clue" : "Video clue"}
          </p>
          <p className="text-[0.75rem] text-[#64748B]">{media.caption ?? "No media file attached."}</p>
        </div>
      </div>
    );
  }

  const mapBoard =
    media.kind === "map"
      ? resolveMapBoard({ mediaArt: media.art, boardArt: media.art, caption: media.caption })
      : null;

  return (
    <QuizImage
      src={mapBoard?.src ?? media.art}
      alt={media.caption ?? mapBoard?.label ?? (media.kind === "map" ? "Map" : "Question image")}
      caption={media.caption}
      className="mx-auto max-w-3xl"
      imgClassName={
        media.kind === "map" ? "max-h-[24rem] object-contain bg-[#d7e6f4]" : "max-h-[22rem] object-cover"
      }
    />
  );
}

export { FlagTile };
