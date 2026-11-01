import { createFileRoute, Outlet } from "@tanstack/react-router";

import { PricingPageBackground } from "@/features/pricing/components/PricingPageBackground";
import "@/features/pricing/styles/pricing-page-light.css";

function PricingLayout() {
  return (
    <div id="gvrze-pricing-page">
      <PricingPageBackground />
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/pricing")({
  component: PricingLayout,
});
