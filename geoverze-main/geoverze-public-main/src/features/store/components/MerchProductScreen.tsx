import { Link } from "@tanstack/react-router";
import { memo } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, PageHeader, SectionContainer } from "@/components/shared";
import type { GeostoreMerchProduct } from "@/features/marketing/data/geostoreMerch";
import { categoryById } from "../data/taxonomy";

/** Presentation-only merchandise detail — no credits or checkout. */
export const MerchProductScreen = memo(function MerchProductScreen({
  product,
}: {
  product: GeostoreMerchProduct;
}) {
  const categorySlug = product.category === "t-shirt" ? "tshirts" : "hoodies";
  const category = categoryById(categorySlug);

  return (
    <PageShell>
      <PageHeader
        eyebrow={product.categoryLabel}
        title={product.title}
        description="Part of the GEOverze merchandise collection."
        breadcrumb={[
          { label: "GEOstore", to: "/geostore" },
          { label: category?.label ?? "Merchandise" },
          { label: product.title },
        ]}
      />
      <SectionContainer size="wide">
        <div className="grid gap-10 lg:grid-cols-2">
          <AnimatedSection>
            <div className="overflow-hidden rounded-2xl border border-bronze/12 bg-[oklch(0.14_0.006_62)]">
              <img
                src={product.image}
                alt={product.alt}
                className="aspect-[16/10] w-full object-contain"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={80} className="space-y-6">
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-bronze/80">
              {product.categoryLabel}
            </p>
            <p className="text-sm leading-relaxed text-foreground/60">
              Premium GEOverze apparel — designed in the same bronze-on-charcoal language as the
              platform. Physical fulfilment is coming soon.
            </p>
            <p className="inline-flex items-center rounded-full border border-bronze/25 bg-bronze/8 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-bronze-glow">
              Available soon
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <GeoButton
                variant="solid"
                disabled
                onClick={() =>
                  toast.message("Available soon", {
                    description: "Merchandise checkout is not live yet.",
                  })
                }
              >
                Available soon
              </GeoButton>
              <GeoButton asChild variant="ghost">
                <Link to="/geostore/category/$slug" params={{ slug: categorySlug }}>
                  Back to {category?.label ?? "collection"}
                </Link>
              </GeoButton>
            </div>
          </AnimatedSection>
        </div>
      </SectionContainer>
    </PageShell>
  );
});
