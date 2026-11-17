import { EditorialCard, type EditorialItem } from "./EditorialCard";

/**
 * Uniform product-card grid used by every Gstore category and browse page.
 * Equal columns and matching card heights — no featured / masonry tiles.
 *
 *   mobile  < 768px   2 columns
 *   tablet  ≥ 768px   3 columns
 *   desktop ≥ 1280px  4 columns
 */
export function StorefrontCategoryGrid({
  items,
  onAdd,
}: {
  items: EditorialItem[];
  onAdd: (item: EditorialItem) => void;
}) {
  return (
    <div className="gvrze-category-grid">
      {items.map((item) => (
        <EditorialCard
          key={item.id}
          item={item}
          {...(item.comingSoon ? {} : { onAdd: () => onAdd(item) })}
        />
      ))}
    </div>
  );
}
