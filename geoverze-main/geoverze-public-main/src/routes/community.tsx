import { createFileRoute } from "@tanstack/react-router";

import { CommunityLayout } from "@/features/community";

export const Route = createFileRoute("/community")({
  component: CommunityLayout,
});
