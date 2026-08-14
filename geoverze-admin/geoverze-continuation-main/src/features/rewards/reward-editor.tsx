import { useState } from "react";

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
import {
  eligibilityRules,
  rewardStatuses,
  rewardTypes,
  type EligibilityRule,
  type Reward,
  type RewardStatus,
  type RewardType,
} from "@/features/rewards/types";
import { catalogDaysAgo } from "@/lib/catalog";

export function createDraftReward(): Reward {
  return {
    id: `RWD-${Math.floor(Math.random() * 400) + 600}`,
    name: "",
    description: "",
    type: "Credits",
    eligibility: "All players",
    creditsRequired: 250,
    stock: 100,
    unlimited: false,
    status: "draft",
    availableFrom: catalogDaysAgo(0, 9),
    expiresAt: catalogDaysAgo(-60, 9),
    claims: 0,
    createdAt: catalogDaysAgo(0, 9),
    updatedAt: catalogDaysAgo(0, 9),
  };
}

export function RewardEditor({
  reward,
  onSave,
  onCancel,
}: {
  reward: Reward;
  onSave: (reward: Reward) => void;
  onCancel?: (() => void) | undefined;
}) {
  const [draft, setDraft] = useState<Reward>(reward);

  const set = <K extends keyof Reward>(key: K, value: Reward[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Reward name is required.");
  if (draft.creditsRequired < 0) errors.push("Credit cost cannot be negative.");
  if (!draft.unlimited && draft.stock <= 0)
    errors.push("Limited rewards need stock greater than zero.");
  if (new Date(draft.expiresAt) <= new Date(draft.availableFrom))
    errors.push("Expiry must be after the availability date.");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (errors.length) return;
        onSave({ ...draft, updatedAt: new Date().toISOString() });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="reward-name">Name</Label>
        <Input
          id="reward-name"
          value={draft.name}
          onChange={(event) => set("name", event.target.value)}
          placeholder="Explorer Hoodie"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reward-description">Description</Label>
        <Textarea
          id="reward-description"
          rows={3}
          value={draft.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reward-type">Type</Label>
          <Select value={draft.type} onValueChange={(value) => set("type", value as RewardType)}>
            <SelectTrigger id="reward-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rewardTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reward-eligibility">Eligibility</Label>
          <Select
            value={draft.eligibility}
            onValueChange={(value) => set("eligibility", value as EligibilityRule)}
          >
            <SelectTrigger id="reward-eligibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eligibilityRules.map((rule) => (
                <SelectItem key={rule} value={rule}>
                  {rule}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reward-credits">Credit cost</Label>
          <Input
            id="reward-credits"
            type="number"
            min={0}
            value={draft.creditsRequired}
            onChange={(event) => set("creditsRequired", Number(event.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reward-status">Status</Label>
          <Select
            value={draft.status}
            onValueChange={(value) => set("status", value as RewardStatus)}
          >
            <SelectTrigger id="reward-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rewardStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reward-from">Available from</Label>
          <Input
            id="reward-from"
            type="date"
            value={draft.availableFrom.slice(0, 10)}
            onChange={(event) => set("availableFrom", new Date(event.target.value).toISOString())}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reward-expires">Expires</Label>
          <Input
            id="reward-expires"
            type="date"
            value={draft.expiresAt.slice(0, 10)}
            onChange={(event) => set("expiresAt", new Date(event.target.value).toISOString())}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div>
          <Label htmlFor="reward-unlimited">Unlimited stock</Label>
          <p className="text-xs text-muted-foreground">Disable to track a finite inventory.</p>
        </div>
        <Switch
          id="reward-unlimited"
          checked={draft.unlimited}
          onCheckedChange={(checked) => set("unlimited", checked)}
        />
      </div>

      {!draft.unlimited && (
        <div className="space-y-1.5">
          <Label htmlFor="reward-stock">Stock</Label>
          <Input
            id="reward-stock"
            type="number"
            min={0}
            value={draft.stock}
            onChange={(event) => set("stock", Number(event.target.value))}
          />
        </div>
      )}

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={errors.length > 0}>
          Save reward
        </Button>
      </div>
    </form>
  );
}
