import { createFileRoute } from "@tanstack/react-router";

import { GeostoreLayout } from "@/features/store/components/GeostoreLayout";

export const Route = createFileRoute("/geostore")({
  component: GeostoreLayout,
});
