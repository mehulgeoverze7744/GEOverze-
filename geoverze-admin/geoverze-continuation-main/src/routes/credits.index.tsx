import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownCircle, ArrowUpCircle, Coins, Receipt, Settings2 } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { DataTable } from "@/components/shared/data-table";
import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { buildTransactionColumns } from "@/features/credits/columns";
import { creditTransactions, summarizeCredits } from "@/features/credits/data";
import { filterTransactions } from "@/features/credits/filtering";
import { creditDirections, creditReasons, emptyCreditFilters } from "@/features/credits/types";
import { num } from "@/lib/format";

export const Route = createFileRoute("/credits/")({
  head: () => ({
    meta: [
      { title: "Credit Ledger — GEOverze Admin" },
      {
        name: "description",
        content: "Every GEOcredit issuance, redemption and adjustment in one auditable ledger.",
      },
      { property: "og:title", content: "Credit Ledger — GEOverze Admin" },
      { property: "og:description", content: "Auditable GEOcredit transaction ledger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreditLedgerPage,
});

const filterDefs: FilterDefinition[] = [
  {
    id: "direction",
    label: "Direction",
    multiple: false,
    options: creditDirections.map((value) => ({ value, label: value })),
  },
  {
    id: "reason",
    label: "Reason",
    multiple: false,
    options: creditReasons.map((value) => ({ value, label: value })),
  },
  {
    id: "window",
    label: "Period",
    multiple: false,
    options: [
      { value: "7", label: "Last 7 days" },
      { value: "30", label: "Last 30 days" },
      { value: "90", label: "Last 90 days" },
    ],
  },
];

function CreditLedgerPage() {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});

  const filters = useMemo(
    () => ({
      direction: filterValues["direction"]?.[0] ?? emptyCreditFilters.direction,
      reason: filterValues["reason"]?.[0] ?? emptyCreditFilters.reason,
      window: filterValues["window"]?.[0] ?? emptyCreditFilters.window,
    }),
    [filterValues],
  );

  const rows = useMemo(
    () => filterTransactions(creditTransactions, query, filters),
    [query, filters],
  );
  const columns = useMemo(() => buildTransactionColumns(query), [query]);
  const summary = useMemo(() => summarizeCredits(creditTransactions), []);

  return (
    <>
      <PageHeader
        title="Credit Ledger"
        description="Auditable record of every GEOcredit issued, redeemed or adjusted."
      />

      <PageBody>
        <StatGrid columns={5} label="Credit economy statistics">
          <StatCard label="Credits issued" value={num(summary.issued)} icon={ArrowUpCircle} />
          <StatCard label="Credits redeemed" value={num(summary.redeemed)} icon={ArrowDownCircle} />
          <StatCard
            label="Outstanding"
            value={num(summary.outstanding)}
            icon={Coins}
            hint="Liability"
          />
          <StatCard label="Transactions" value={num(summary.transactions)} icon={Receipt} />
          <StatCard label="Active rules" value={num(summary.activeRules)} icon={Settings2} />
        </StatGrid>

        <ActionToolbar>
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search transactions"
            placeholder="Search member, transaction or reference…"
          />
        </ActionToolbar>

        <FilterBar filters={filterDefs} value={filterValues} onChange={setFilterValues} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(creditTransactions.length)} transactions
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(item) => item.id}
          highlight={query}
          hideToolbar
          hideBulkBar
          pageSize={25}
          emptyTitle="No transactions match your filters"
          emptyDescription="Adjust the search or reset the filters."
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.user}</p>
              <p className="text-xs text-muted-foreground">
                {item.direction} · {num(item.amount)} credits · {item.reason}
              </p>
            </div>
          )}
        />
      </PageBody>
    </>
  );
}
