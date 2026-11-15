import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { DataTable } from "@/components/shared/data-table";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchCreditRollover, updateCreditRollover } from "@/features/commerce/api";
import { adminKeys } from "@/lib/admin/keys";
import { useAdminQuery } from "@/lib/admin/hooks";
import { formatAdminError } from "@/lib/supabase/query";
import { useState } from "react";

export const Route = createFileRoute("/credits/rules")({
  head: () => ({
    meta: [
      { title: "Credit Rules — GVRZE Admin" },
      {
        name: "description",
        content: "Configure how GEOcredits are earned, capped, expired and reset.",
      },
      { property: "og:title", content: "Credit Rules — GVRZE Admin" },
      { property: "og:description", content: "Earning rules, caps and reset configuration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreditRulesPage,
});

function CreditRulesPage() {
  const query = useAdminQuery(adminKeys.creditRules, fetchCreditRollover);
  const rows = query.data ?? [];
  const [drafts, setDrafts] = useState<Record<string, number>>({});

  return (
    <>
      <PageHeader
        title="Credit Rules"
        description="Plan rollover windows live in credit_plan_rollover_config. Quiz and streak awards are encoded in the public application's apply_user_progression_rewards function and are not duplicated here."
      />

      <PageBody>
        <DataTable
          data={rows}
          columns={[
            { id: "plan_tier", header: "Plan", accessor: (row) => row.plan_tier },
            {
              id: "rollover_months",
              header: "Rollover months",
              accessor: (row) => row.rollover_months,
              cell: (row) => (
                <Input
                  type="number"
                  min={0}
                  className="h-8 w-24"
                  value={drafts[row.plan_tier] ?? row.rollover_months}
                  onChange={(event) =>
                    setDrafts((prev) => ({ ...prev, [row.plan_tier]: Number(event.target.value) }))
                  }
                />
              ),
            },
          ]}
          getRowId={(item) => item.plan_tier}
          hideBulkBar
          loading={query.loading}
          emptyTitle="No rollover configuration found"
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.plan_tier}</p>
              <p className="text-xs text-muted-foreground">{item.rollover_months} months</p>
            </div>
          )}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              void Promise.all(
                Object.entries(drafts).map(([tier, months]) => updateCreditRollover(tier, months)),
              )
                .then(() => {
                  toast.success("Rollover configuration saved.");
                  setDrafts({});
                  void query.refetch();
                })
                .catch((error) => toast.error(formatAdminError(error)));
            }}
            disabled={Object.keys(drafts).length === 0}
          >
            Save configuration
          </Button>
        </div>
      </PageBody>
    </>
  );
}
