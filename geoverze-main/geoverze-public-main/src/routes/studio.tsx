import { Outlet, createFileRoute } from "@tanstack/react-router";

function StudioLayout() {
  return (
    <div id="gvrze-studio">
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/studio")({
  component: StudioLayout,
});
