import { createFileRoute } from "@tanstack/react-router";

import { ImposterRoomScreen } from "@/features/geography-imposter";

const t = "Room — GEOsus · GVRZE";
const d = "Live GEOsus room lobby and game.";

export const Route = createFileRoute("/play/imposter/room")({
  validateSearch: (search: Record<string, unknown>) => ({
    room: typeof search["room"] === "string" ? search["room"] : undefined,
    code: typeof search["code"] === "string" ? search["code"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: t },
      { name: "description", content: d },
      { property: "og:title", content: t },
      { property: "og:description", content: d },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { room, code } = Route.useSearch();
  return <ImposterRoomScreen roomId={room} code={code} />;
}
