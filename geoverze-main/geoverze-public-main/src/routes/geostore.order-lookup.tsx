import { createFileRoute } from "@tanstack/react-router";
import { GstoreOrderLookupScreen } from "@/features/store/screens/GstoreOrderLookupScreen";

export const Route = createFileRoute("/geostore/order-lookup")({
  component: GstoreOrderLookupScreen,
});
