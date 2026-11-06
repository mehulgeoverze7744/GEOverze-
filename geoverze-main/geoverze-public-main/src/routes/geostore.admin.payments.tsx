import { createFileRoute } from "@tanstack/react-router";
import { GstorePaymentAdminScreen } from "@/features/store/screens/GstorePaymentAdminScreen";

export const Route = createFileRoute("/geostore/admin/payments")({
  component: GstorePaymentAdminScreen,
});
