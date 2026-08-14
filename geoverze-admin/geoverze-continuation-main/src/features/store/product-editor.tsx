import { useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";

import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  productStatuses,
  productTypes,
  type ProductStatus,
  type ProductType,
  type StoreProduct,
} from "@/features/store/types";
import { catalogDaysAgo, storeCategories, storeCollections } from "@/lib/catalog";
import { money } from "@/lib/format";

export function createDraftProduct(): StoreProduct {
  const id = `GS-${Math.floor(Math.random() * 9000) + 9000}`;
  return {
    id,
    name: "",
    sku: id,
    type: "Physical",
    category: storeCategories[0] ?? "Apparel",
    collection: storeCollections[0] ?? "Core",
    description: "",
    price: 0,
    compareAtPrice: 0,
    discountPercent: 0,
    creditPrice: 0,
    stock: 0,
    stockStatus: "Out of stock",
    status: "draft",
    featured: false,
    available: false,
    images: [],
    variants: [],
    shippingClass: "Standard",
    unitsSold: 0,
    revenue: 0,
    revenueSeries: Array.from({ length: 12 }, () => 0),
    createdAt: catalogDaysAgo(0, 9),
    updatedAt: catalogDaysAgo(0, 9),
  };
}

interface ProductEditorProps {
  product: StoreProduct;
  onSave: (product: StoreProduct) => void;
  onCancel?: (() => void) | undefined;
  submitLabel?: string | undefined;
}

export function ProductEditor({
  product,
  onSave,
  onCancel,
  submitLabel = "Save product",
}: ProductEditorProps) {
  const [draft, setDraft] = useState<StoreProduct>(product);
  const [imageInput, setImageInput] = useState("");

  const set = <K extends keyof StoreProduct>(key: K, value: StoreProduct[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Product name is required.");
  if (!draft.sku.trim()) errors.push("SKU is required.");
  if (draft.price < 0) errors.push("Price cannot be negative.");
  if (draft.type === "Credit Redemption" && draft.creditPrice <= 0)
    errors.push("Credit redemption products need a credit price.");

  const netPrice = Math.round(draft.price * (1 - draft.discountPercent / 100));

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (errors.length) return;
        onSave({ ...draft, updatedAt: catalogDaysAgo(0, 12) });
      }}
    >
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          <SectionHeader title="Product details" description="Storefront copy and taxonomy" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-name">Name</Label>
              <Input
                id="product-name"
                value={draft.name}
                onChange={(event) => set("name", event.target.value)}
                placeholder="Explorer Hoodie"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-sku">SKU</Label>
              <Input
                id="product-sku"
                value={draft.sku}
                onChange={(event) => set("sku", event.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-type">Type</Label>
              <Select
                value={draft.type}
                onValueChange={(value) => set("type", value as ProductType)}
              >
                <SelectTrigger id="product-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-status">Status</Label>
              <Select
                value={draft.status}
                onValueChange={(value) => set("status", value as ProductStatus)}
              >
                <SelectTrigger id="product-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-category">Category</Label>
              <Select value={draft.category} onValueChange={(value) => set("category", value)}>
                <SelectTrigger id="product-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {storeCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-collection">Collection</Label>
              <Select value={draft.collection} onValueChange={(value) => set("collection", value)}>
                <SelectTrigger id="product-collection">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {storeCollections.map((collection) => (
                    <SelectItem key={collection} value={collection}>
                      {collection}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              rows={4}
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={draft.featured}
                onCheckedChange={(checked) => set("featured", checked)}
              />
              Featured product
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={draft.available}
                onCheckedChange={(checked) => set("available", checked)}
              />
              Available for purchase
            </label>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4 space-y-4">
          <SectionHeader title="Pricing" description="Cash price, discounts and credit cost" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-price">Price (USD)</Label>
              <Input
                id="product-price"
                type="number"
                min={0}
                value={draft.price}
                onChange={(event) => set("price", Number(event.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-compare">Compare at</Label>
              <Input
                id="product-compare"
                type="number"
                min={0}
                value={draft.compareAtPrice}
                onChange={(event) => set("compareAtPrice", Number(event.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-discount">Discount (%)</Label>
              <Input
                id="product-discount"
                type="number"
                min={0}
                max={90}
                value={draft.discountPercent}
                onChange={(event) => set("discountPercent", Number(event.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-credits">Credit price</Label>
              <Input
                id="product-credits"
                type="number"
                min={0}
                value={draft.creditPrice}
                onChange={(event) => set("creditPrice", Number(event.target.value))}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Customers pay <span className="font-medium text-foreground">{money(netPrice)}</span>{" "}
            after discount.
          </p>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4 space-y-4">
          <SectionHeader title="Inventory" description="Stock levels, variants and shipping" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-stock">Stock on hand</Label>
              <Input
                id="product-stock"
                type="number"
                min={0}
                value={draft.stock}
                onChange={(event) => {
                  const stock = Math.max(0, Number(event.target.value));
                  setDraft((prev) => ({
                    ...prev,
                    stock,
                    stockStatus:
                      stock === 0 ? "Out of stock" : stock < 15 ? "Low stock" : "In stock",
                  }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-shipping">Shipping class</Label>
              <Input
                id="product-shipping"
                value={draft.shippingClass}
                onChange={(event) => set("shippingClass", event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Variants</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  set("variants", [
                    ...draft.variants,
                    {
                      id: `${draft.sku}-V${draft.variants.length + 1}`,
                      name: "New variant",
                      sku: `${draft.sku}-${draft.variants.length + 1}`,
                      price: draft.price,
                      stock: 0,
                    },
                  ])
                }
              >
                <Plus className="size-4" aria-hidden="true" />
                Add variant
              </Button>
            </div>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {draft.variants.length === 0 && (
                <li className="p-3 text-sm text-muted-foreground">No variants configured.</li>
              )}
              {draft.variants.map((variant, index) => (
                <li key={variant.id} className="flex flex-wrap items-center gap-2 p-2">
                  <Input
                    aria-label={`Variant ${index + 1} name`}
                    className="max-w-40"
                    value={variant.name}
                    onChange={(event) =>
                      set(
                        "variants",
                        draft.variants.map((entry) =>
                          entry.id === variant.id ? { ...entry, name: event.target.value } : entry,
                        ),
                      )
                    }
                  />
                  <Input
                    aria-label={`Variant ${index + 1} price`}
                    type="number"
                    className="max-w-28"
                    value={variant.price}
                    onChange={(event) =>
                      set(
                        "variants",
                        draft.variants.map((entry) =>
                          entry.id === variant.id
                            ? { ...entry, price: Number(event.target.value) }
                            : entry,
                        ),
                      )
                    }
                  />
                  <Input
                    aria-label={`Variant ${index + 1} stock`}
                    type="number"
                    className="max-w-28"
                    value={variant.stock}
                    onChange={(event) =>
                      set(
                        "variants",
                        draft.variants.map((entry) =>
                          entry.id === variant.id
                            ? { ...entry, stock: Number(event.target.value) }
                            : entry,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove variant ${variant.name}`}
                    onClick={() =>
                      set(
                        "variants",
                        draft.variants.filter((entry) => entry.id !== variant.id),
                      )
                    }
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-4 space-y-3">
          <SectionHeader title="Media" description="Product imagery placeholders" />
          <div className="flex gap-2">
            <Input
              aria-label="Image label"
              value={imageInput}
              placeholder="front-view"
              onChange={(event) => setImageInput(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!imageInput.trim()) return;
                set("images", [...draft.images, imageInput.trim()]);
                setImageInput("");
              }}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {draft.images.map((image) => (
              <Badge key={image} variant="secondary" className="gap-1">
                {image}
                <button
                  type="button"
                  aria-label={`Remove ${image}`}
                  onClick={() =>
                    set(
                      "images",
                      draft.images.filter((entry) => entry !== image),
                    )
                  }
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            ))}
            {draft.images.length === 0 && (
              <p className="text-sm text-muted-foreground">No images yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {errors.length > 0 && (
        <ul className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={errors.length > 0}>
          <Save className="size-4" aria-hidden="true" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
