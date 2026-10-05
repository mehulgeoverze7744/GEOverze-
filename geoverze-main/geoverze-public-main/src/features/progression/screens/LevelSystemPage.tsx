import { Navigate } from "@tanstack/react-router";

/** Legacy /play/level-system route — levels are not active yet. */
export function LevelSystemPage() {
  return <Navigate to="/play/progression" replace />;
}
