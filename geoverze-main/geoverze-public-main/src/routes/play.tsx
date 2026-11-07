import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";

import { GameBackButton } from "@/features/play/components/GameBackButton";
import { PlayPageBackground } from "@/features/play/components/PlayPageBackground";
import { isPlayHubPath } from "@/features/play/lib/playBackNavigation";
import "@/features/play/components/play-page-light.css";

function PlayLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div id="lets-play-page">
      <PlayPageBackground preset="geo" />
      {isPlayHubPath(pathname) ? null : <GameBackButton />}
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/play")({
  component: PlayLayout,
});
