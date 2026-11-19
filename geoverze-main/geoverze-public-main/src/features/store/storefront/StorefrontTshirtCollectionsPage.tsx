/**
 * T-Shirts category shelf — PRIME signature graphics and BASICS essentials.
 */
import { cn } from "@/lib/utils";

import { type EditorialItem } from "./EditorialCard";
import { StorefrontCategoryGrid } from "./StorefrontCategoryGrid";
import { StorefrontNav } from "./StorefrontNav";
import { SF_SHELL } from "./storefront-ui";

function CollectionSection({
  title,
  description,
  items,
  onAdd,
}: {
  title: string;
  description: string;
  items: EditorialItem[];
  onAdd?: (item: EditorialItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10 md:mt-14" aria-labelledby={`tshirt-line-${title}`}>
      <div className="space-y-1">
        <h2
          id={`tshirt-line-${title}`}
          className="text-[13px] font-semibold uppercase tracking-[0.2em] text-black/45"
          style={{ fontFamily: "var(--sf-font-ui)" }}
        >
          {title}
        </h2>
        <p className="text-sm text-black/55">{description}</p>
      </div>
      <div className="mt-5">
        <StorefrontCategoryGrid items={items} onAdd={(item) => onAdd?.(item)} />
      </div>
    </section>
  );
}

export function StorefrontTshirtCollectionsPage({
  primeItems,
  basicsItems,
  onAdd,
}: {
  primeItems: EditorialItem[];
  basicsItems: EditorialItem[];
  onAdd?: (item: EditorialItem) => void;
}) {
  return (
    <div id="gvrze-storefront">
      <StorefrontNav variant="solid" />

      <main className="min-h-screen bg-[#f5f5f5]">
        <div className={cn(SF_SHELL, "pb-10 pt-5 md:py-14")}>
          <div className="mb-2">
            <h1
              className="text-[22px] font-semibold tracking-tight text-black md:text-[40px]"
              style={{ fontFamily: "var(--sf-font-body)" }}
            >
              T-Shirts
            </h1>
            <p className="mt-1 hidden text-sm text-black/50 md:block">
              Collections: PRIME signature graphics and BASICS everyday essentials.
            </p>
          </div>

          <CollectionSection
            title="PRIME"
            description="Signature graphic tees from the GVRZE collection."
            items={primeItems}
            onAdd={onAdd}
          />

          <CollectionSection
            title="BASICS"
            description="Essential silhouettes with minimal fronts and statement backs."
            items={basicsItems}
            onAdd={onAdd}
          />
        </div>
      </main>
    </div>
  );
}