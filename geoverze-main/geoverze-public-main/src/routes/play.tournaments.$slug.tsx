import { createFileRoute } from "@tanstack/react-router";

import { TournamentDetailPage } from "@/features/tournaments";
import { tournamentBySlug } from "@/features/tournaments/data/tournaments";

export const Route = createFileRoute("/play/tournaments/$slug")({
  head: ({ params }) => {
    const tournament = tournamentBySlug(params.slug);
    const t = tournament ? `${tournament.title} — Tournaments — GEOverze` : "Tournament — GEOverze";
    const d = tournament ? tournament.summary : "GEOverze geography tournaments and brackets.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: TournamentDetailPage,
});
