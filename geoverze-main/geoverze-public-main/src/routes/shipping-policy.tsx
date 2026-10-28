import { createFileRoute } from "@tanstack/react-router";

import { LegalPageView } from "@/features/legal/components/LegalPageView";
import { shippingSections } from "@/features/legal/content/shipping";
import { legalHead } from "@/features/legal/legal-head";

const title = "Shipping Policy";
const description =
  "How physical GEOstore orders will be processed and shipped once a paid order is accepted. No delivery promise is made.";

export const Route = createFileRoute("/shipping-policy")({
  head: () => legalHead(title, description, "/shipping-policy"),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <LegalPageView
      path="/shipping-policy"
      title={title}
      description="Rules for physical GEOstore merchandise. Digital access is not shipped, and no delivery time is confirmed."
      sections={shippingSections}
    />
  );
}
