import { useState } from "react";
import { Save } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { couponTypes, type Coupon, type CouponType } from "@/features/store/types";
import { catalogDaysAgo } from "@/lib/catalog";

export function createDraftCoupon(): Coupon {
  return {
    id: `CPN-${Math.floor(Math.random() * 900) + 900}`,
    code: "",
    type: "Percentage",
    value: 10,
    usageLimit: 100,
    used: 0,
    active: true,
    expiresAt: catalogDaysAgo(-30, 9),
    createdAt: catalogDaysAgo(0, 9),
    description: "",
  };
}

export function CouponEditor({
  coupon,
  onSave,
  onCancel,
}: {
  coupon: Coupon;
  onSave: (coupon: Coupon) => void;
  onCancel?: (() => void) | undefined;
}) {
  const [draft, setDraft] = useState<Coupon>(coupon);

  const set = <K extends keyof Coupon>(key: K, value: Coupon[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const errors: string[] = [];
  if (!draft.code.trim()) errors.push("Coupon code is required.");
  if (draft.value <= 0) errors.push("Coupon value must be greater than zero.");
  if (draft.type === "Percentage" && draft.value > 90)
    errors.push("Percentage discounts are capped at 90%.");
  if (draft.usageLimit < draft.used) errors.push("Usage limit cannot be below current usage.");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (errors.length) return;
        onSave(draft);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="coupon-code">Code</Label>
          <Input
            id="coupon-code"
            value={draft.code}
            onChange={(event) => set("code", event.target.value.toUpperCase())}
            placeholder="GEOSAVE20"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="coupon-type">Type</Label>
          <Select value={draft.type} onValueChange={(value) => set("type", value as CouponType)}>
            <SelectTrigger id="coupon-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {couponTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="coupon-value">Value</Label>
          <Input
            id="coupon-value"
            type="number"
            min={0}
            value={draft.value}
            onChange={(event) => set("value", Number(event.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="coupon-limit">Usage limit</Label>
          <Input
            id="coupon-limit"
            type="number"
            min={0}
            value={draft.usageLimit}
            onChange={(event) => set("usageLimit", Number(event.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="coupon-expiry">Expires</Label>
          <Input
            id="coupon-expiry"
            type="date"
            value={draft.expiresAt.slice(0, 10)}
            onChange={(event) =>
              set("expiresAt", new Date(`${event.target.value}T09:00:00Z`).toISOString())
            }
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={draft.active} onCheckedChange={(checked) => set("active", checked)} />
            Active
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="coupon-description">Description</Label>
        <Textarea
          id="coupon-description"
          rows={3}
          value={draft.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </div>

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
          Save coupon
        </Button>
      </div>
    </form>
  );
}
