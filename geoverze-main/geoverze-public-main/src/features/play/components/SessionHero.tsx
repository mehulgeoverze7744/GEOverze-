import { cn } from "@/lib/utils";
import { CoverArt } from "./CoverArt";
import { coverFromThumbnail, type SessionThumbnail } from "../data/sessionArtwork";

/** Shared session/lobby cover — same crop rules as Let's Play cards. */
export function SessionHero({
  thumbnail,
  art = "solo",
  ratio = "wide",
  className,
}: {
  thumbnail?: SessionThumbnail | undefined;
  art?: string | undefined;
  ratio?: "wide" | "video" | "banner" | undefined;
  className?: string | undefined;
}) {
  return (
    <CoverArt
      art={art}
      ratio={ratio}
      className={cn("overflow-hidden", className)}
      {...coverFromThumbnail(thumbnail)}
    />
  );
}
