import { createFileRoute } from "@tanstack/react-router";
import { GstoreAdminScreen } from "@/features/store/screens/GstoreAdminScreen";

export const Route = createFileRoute("/geostore/admin")({
  component: GstoreAdminScreen,
});
