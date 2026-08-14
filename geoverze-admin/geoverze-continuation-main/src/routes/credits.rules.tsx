import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DataTable } from "@/components/shared/data-table";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SideDrawer } from "@/components/shared/side-drawer";
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
import { buildRuleColumns } from "@/features/credits/columns";
import { creditResetConfig, creditRules } from "@/features/credits/data";
import type { CreditResetConfig, CreditRule } from "@/features/credits/types";
import { toast } from "sonner";

export const Route = createFileRoute("/credits/rules")({
  head: () => ({
    meta: [
      { title: "Credit Rules — GEOverze Admin" },
      {
        name: "description",
        content: "Configure how GEOcredits are earned, capped, expired and reset.",
      },
      { property: "og:title", content: "Credit Rules — GEOverze Admin" },
      { property: "og:description", content: "Earning rules, caps and reset configuration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreditRulesPage,
});

function CreditRulesPage() {
  const [rules, setRules] = useState<CreditRule[]>(creditRules);
  const [active, setActive] = useState<CreditRule | null>(null);
  const [reset, setReset] = useState<CreditResetConfig>(creditResetConfig);
  const columns = useMemo(() => buildRuleColumns(), []);

  const current = active ? (rules.find((rule) => rule.id === active.id) ?? active) : null;

  const saveRule = (rule: CreditRule) => {
    setRules((prev) => prev.map((item) => (item.id === rule.id ? rule : item)));
    toast.success(`Updated “${rule.name}”.`);
    setActive(null);
  };

  return (
    <>
      <PageHeader
        title="Credit Rules"
        description="Earning triggers, daily caps and the credit reset policy."
      />

      <PageBody>
        <DataTable
          data={rules}
          columns={columns}
          getRowId={(item) => item.id}
          hideBulkBar
          onRowClick={(item) => setActive(item)}
          emptyTitle="No credit rules configured"
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                +{item.award} credits · cap {item.dailyCap}
              </p>
            </div>
          )}
        />

        <section
          aria-labelledby="reset-config"
          className="space-y-4 rounded-lg border border-border bg-card p-4"
        >
          <div>
            <h2 id="reset-config" className="text-sm font-semibold text-foreground">
              Reset configuration
            </h2>
            <p className="text-xs text-muted-foreground">
              Controls when balances reset and how much carries over.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="reset-cadence">Cadence</Label>
              <Select
                value={reset.cadence}
                onValueChange={(value) =>
                  setReset((prev) => ({ ...prev, cadence: value as CreditResetConfig["cadence"] }))
                }
              >
                <SelectTrigger id="reset-cadence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["never", "monthly", "quarterly", "annually"] as const).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reset-day">Reset day</Label>
              <Input
                id="reset-day"
                type="number"
                min={1}
                max={28}
                value={reset.resetDay}
                onChange={(event) =>
                  setReset((prev) => ({ ...prev, resetDay: Number(event.target.value) }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reset-carry">Carry over %</Label>
              <Input
                id="reset-carry"
                type="number"
                min={0}
                max={100}
                value={reset.carryOverPercent}
                onChange={(event) =>
                  setReset((prev) => ({ ...prev, carryOverPercent: Number(event.target.value) }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reset-expiry">Expiry (days)</Label>
              <Input
                id="reset-expiry"
                type="number"
                min={0}
                value={reset.expiryDays}
                onChange={(event) =>
                  setReset((prev) => ({ ...prev, expiryDays: Number(event.target.value) }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast.success("Reset configuration saved.")}>
              Save configuration
            </Button>
          </div>
        </section>
      </PageBody>

      <SideDrawer
        open={Boolean(current)}
        onOpenChange={(open) => !open && setActive(null)}
        title={current?.name ?? "Rule"}
        description={current?.trigger}
      >
        {current && <RuleForm rule={current} onSave={saveRule} onCancel={() => setActive(null)} />}
      </SideDrawer>
    </>
  );
}

function RuleForm({
  rule,
  onSave,
  onCancel,
}: {
  rule: CreditRule;
  onSave: (rule: CreditRule) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<CreditRule>(rule);
  const invalid = draft.award <= 0 || draft.dailyCap < draft.award;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (invalid) return;
        onSave({ ...draft, updatedAt: new Date().toISOString() });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="rule-award">Award per trigger</Label>
        <Input
          id="rule-award"
          type="number"
          min={1}
          value={draft.award}
          onChange={(event) => setDraft((prev) => ({ ...prev, award: Number(event.target.value) }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rule-cap">Daily cap</Label>
        <Input
          id="rule-cap"
          type="number"
          min={0}
          value={draft.dailyCap}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, dailyCap: Number(event.target.value) }))
          }
        />
      </div>
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <Label htmlFor="rule-enabled">Rule enabled</Label>
        <Switch
          id="rule-enabled"
          checked={draft.enabled}
          onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, enabled: checked }))}
        />
      </div>
      {invalid && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          The award must be positive and the daily cap must be at least the award amount.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={invalid}>
          Save rule
        </Button>
      </div>
    </form>
  );
}
