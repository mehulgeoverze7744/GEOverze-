import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import {
  emptyOrderFilters,
  emptyProductFilters,
  orderStatuses,
  productTypes,
  stockStatuses,
  type OrderFilterState,
  type ProductFilterState,
} from "@/features/store/types";
import { orderChannels, storeCategories, storeCollections } from "@/lib/catalog";

const productDefinitions: FilterDefinition[] = [
  {
    id: "status",
    label: "Status",
    multiple: false,
    options: [
      { label: "Published", value: "published" },
      { label: "Draft", value: "draft" },
      { label: "Archived", value: "archived" },
    ],
  },
  {
    id: "type",
    label: "Type",
    multiple: false,
    options: productTypes.map((type) => ({ label: type, value: type })),
  },
  {
    id: "category",
    label: "Category",
    multiple: false,
    options: storeCategories.map((category) => ({ label: category, value: category })),
  },
  {
    id: "collection",
    label: "Collection",
    multiple: false,
    options: storeCollections.map((collection) => ({ label: collection, value: collection })),
  },
  {
    id: "stock",
    label: "Inventory",
    multiple: false,
    options: stockStatuses.map((status) => ({ label: status, value: status })),
  },
  {
    id: "featured",
    label: "Featured",
    multiple: false,
    options: [
      { label: "Featured only", value: "featured" },
      { label: "Not featured", value: "standard" },
    ],
  },
];

const orderDefinitions: FilterDefinition[] = [
  {
    id: "status",
    label: "Status",
    multiple: false,
    options: orderStatuses.map((status) => ({ label: status, value: status })),
  },
  {
    id: "channel",
    label: "Channel",
    multiple: false,
    options: orderChannels.map((channel) => ({ label: channel, value: channel })),
  },
];

function toRecord(value: object) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, v]) => v !== "all")
      .map(([key, v]) => [key, [v]]),
  ) as Record<string, string[]>;
}

export function ProductFilters({
  value,
  onChange,
}: {
  value: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
}) {
  return (
    <FilterBar
      filters={productDefinitions}
      value={toRecord(value)}
      onChange={(next) => {
        const merged: ProductFilterState = { ...emptyProductFilters };
        for (const key of Object.keys(emptyProductFilters) as (keyof ProductFilterState)[]) {
          merged[key] = next[key]?.[0] ?? "all";
        }
        onChange(merged);
      }}
    />
  );
}

export function OrderFilters({
  value,
  onChange,
}: {
  value: OrderFilterState;
  onChange: (next: OrderFilterState) => void;
}) {
  return (
    <FilterBar
      filters={orderDefinitions}
      value={toRecord(value)}
      onChange={(next) => {
        const merged: OrderFilterState = { ...emptyOrderFilters };
        for (const key of Object.keys(emptyOrderFilters) as (keyof OrderFilterState)[]) {
          merged[key] = next[key]?.[0] ?? "all";
        }
        onChange(merged);
      }}
    />
  );
}
