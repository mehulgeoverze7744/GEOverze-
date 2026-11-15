import { createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/shared/empty-state";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/store/coupons")({
  head: () => ({
    meta: [
      { title: "GVRZE Store Coupons — GVRZE Admin" },
      {
        name: "description",
        content: "Create and manage GVRZE Store discount codes, credit rewards and usage limits.",
      },
      { property: "og:title", content: "GVRZE Store Coupons — GVRZE Admin" },
      { property: "og:description", content: "Discount codes and promotional controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoreCouponsPage,
});

function StoreCouponsPage() {
  return (
    <>
      <PageHeader
        title="Coupons & Discounts"
        description="The shared GEOverze database has no coupon catalogue table. Gstore discounts currently live on individual order rows and are not independently manageable."
        actions={
          <Button
            size="sm"
            onClick={() =>
              toast.info("A coupon table would need a public-app checkout change before Admin can manage codes.")
            }
          >
            New coupon
          </Button>
        }
      />
      <PageBody>
        <EmptyState
          title="No coupon catalogue"
          description="Creating a parallel coupon table would not affect live Gstore checkout. This module stays empty until the public application adds a shared coupon source of truth."
        />
      </PageBody>
    </>
  );
}
