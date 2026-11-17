import { createFileRoute } from "@tanstack/react-router";

import { MembershipAdminScreen } from "@/features/admin/screens/MembershipAdminScreen";

export const Route = createFileRoute("/admin/")({
  component: MembershipAdminScreen,
});
