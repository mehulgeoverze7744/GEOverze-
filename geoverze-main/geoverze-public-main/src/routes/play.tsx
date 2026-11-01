import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PlayPageBackground } from "@/features/play/components/PlayPageBackground";
import "@/features/play/components/play-page-light.css";

function PlayLayout() {
  return (
    <div id="lets-play-page">
      <PlayPageBackground preset="geo" />
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/play")({
  component: PlayLayout,
});
