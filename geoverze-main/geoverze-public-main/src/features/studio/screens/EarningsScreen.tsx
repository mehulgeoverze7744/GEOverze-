import { Coins, Download, Info } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
import { cn } from "@/lib/utils";
import { CREATOR } from "../data/creator";
import { EARNINGS_SUMMARY, PAYOUTS, REVENUE_STREAMS, TRANSACTIONS } from "../data/earnings";
import { MetricTile } from "../components/MetricTile";
import { ShareBars } from "../components/Sparkline";
import { StudioHeader, StudioShell } from "../components/StudioShell";
import { StudioPanel, StudioPanelHeader } from "../components/StudioPanel";
import { formatDate, formatMoney, formatNumber } from "../lib/format";

const KIND_LABEL: Record<string, string> = {
  "quiz-royalty": "Quiz royalty",
  "article-royalty": "Article royalty",
  "bundle-sale": "Bundle sale",
  "credit-bonus": "Credit bonus",
  payout: "Payout",
};

/** Earnings overview. Read-only: no payments are processed anywhere. */
export function EarningsScreen() {
  const streams = REVENUE_STREAMS.map((s) => ({ label: s.label, value: Math.round(s.amount) }));

  return (
    <StudioShell
      context={
        <div className="space-y-4">
          <StudioPanel>
            <StudioPanelHeader title="Payout method" />
            <p className="text-[0.85rem] text-foreground/85">{CREATOR.payout.method}</p>
            <p className="mt-1 text-[0.78rem] text-foreground/50">{CREATOR.payout.detail}</p>
            <p
              className={cn(
                "mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem]",
                CREATOR.payout.connected
                  ? "border-[oklch(0.72_0.13_150/0.5)] text-[oklch(0.86_0.12_150)]"
                  : "border-[oklch(0.72_0.12_75/0.5)] text-[oklch(0.85_0.11_80)]",
              )}
            >
              {CREATOR.payout.connected ? "Connected" : "Not connected yet"}
            </p>
            <GeoButton size="sm" variant="secondary" className="mt-4 w-full" disabled>
              Manage payouts
            </GeoButton>
          </StudioPanel>

          <StudioPanel>
            <StudioPanelHeader title="Next payout" />
            <p className="text-[1.3rem] font-semibold tabular-nums text-bronze-glow">
              {formatMoney(EARNINGS_SUMMARY.availableBalance)}
            </p>
            <p className="mt-1.5 text-[0.78rem] text-foreground/50">
              Scheduled {formatDate(EARNINGS_SUMMARY.nextPayoutDate)}
            </p>
            <p className="mt-3 flex gap-2 text-[0.75rem] text-foreground/50">
              <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} aria-hidden />
              Minimum payout is {formatMoney(EARNINGS_SUMMARY.minimumPayout)}.
            </p>
          </StudioPanel>

          <StudioPanel className="border-bronze/25 bg-bronze/[0.06]">
            <div className="flex items-center gap-2 text-bronze">
              <Coins className="h-4 w-4" strokeWidth={1.9} aria-hidden />
              <p className="text-[0.72rem] uppercase tracking-[0.16em]">Credits earned</p>
            </div>
            <p className="mt-2.5 text-[1.3rem] font-semibold tabular-nums text-foreground">
              {formatNumber(EARNINGS_SUMMARY.creditsEarned)}
            </p>
            <p className="mt-1.5 text-[0.75rem] text-foreground/50">
              Spendable in GEOstore alongside cash earnings.
            </p>
          </StudioPanel>
        </div>
      }
    >
      <StudioHeader
        eyebrow="Business"
        title="Earnings"
        description="Royalties, bundle sales and credit bonuses from everything you have published."
        actions={
          <GeoButton size="sm" variant="secondary" className="gap-2" disabled>
            <Download className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Export CSV
          </GeoButton>
        }
      />

      <div className="grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Total earned"
          value={formatMoney(EARNINGS_SUMMARY.totalEarned)}
          deltaPercent={9.2}
        />
        <MetricTile
          label="Available balance"
          value={formatMoney(EARNINGS_SUMMARY.availableBalance)}
          hint="Clears on the next payout run"
        />
        <MetricTile
          label="Pending clearance"
          value={formatMoney(EARNINGS_SUMMARY.pendingClearance)}
          hint="Settles within 14 days"
        />
        <MetricTile
          label="Last payout"
          value={formatMoney(EARNINGS_SUMMARY.lastPayout.amount)}
          hint={formatDate(EARNINGS_SUMMARY.lastPayout.date)}
        />
      </div>

      <div className="mt-4 grid gap-4 [&>*]:min-w-0 lg:grid-cols-3">
        <StudioPanel>
          <StudioPanelHeader title="Revenue streams" hint="Share of lifetime earnings" />
          <ShareBars points={streams} suffix="" />
        </StudioPanel>

        <StudioPanel className="lg:col-span-2" padded={false}>
          <div className="px-5 pt-5">
            <StudioPanelHeader title="Transactions" hint="Most recent first" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-[0.82rem]">
              <thead>
                <tr className="border-y border-bronze/12 text-[0.68rem] uppercase tracking-[0.16em] text-foreground/50">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    Detail
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((t) => (
                  <tr key={t.id} className="border-b border-bronze/[0.07] last:border-0">
                    <td className="whitespace-nowrap px-5 py-3 text-foreground/50">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-3 py-3 text-foreground/85">
                      {t.label}
                      {t.status === "pending" ? (
                        <span className="ml-2 rounded-full border border-[oklch(0.72_0.12_75/0.5)] px-2 py-0.5 text-[0.65rem] text-[oklch(0.85_0.11_80)]">
                          Pending
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-foreground/50">{KIND_LABEL[t.kind]}</td>
                    <td
                      className={cn(
                        "px-5 py-3 text-right tabular-nums",
                        t.amount === null
                          ? "text-bronze-glow"
                          : t.amount < 0
                            ? "text-foreground/50"
                            : "text-[oklch(0.86_0.12_150)]",
                      )}
                    >
                      {t.amount === null
                        ? `${formatNumber(t.credits ?? 0)} credits`
                        : formatMoney(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StudioPanel>
      </div>

      <StudioPanel className="mt-4" padded={false}>
        <div className="px-5 pt-5">
          <StudioPanelHeader title="Payout history" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-[0.82rem]">
            <thead>
              <tr className="border-y border-bronze/12 text-[0.68rem] uppercase tracking-[0.16em] text-foreground/50">
                <th scope="col" className="px-5 py-3 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Reference
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Method
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {PAYOUTS.map((p) => (
                <tr key={p.id} className="border-b border-bronze/[0.07] last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 text-foreground/50">
                    {formatDate(p.date)}
                  </td>
                  <td className="px-3 py-3 text-foreground/75">{p.reference}</td>
                  <td className="px-3 py-3 text-foreground/55">{p.method}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[0.68rem]",
                        p.status === "paid"
                          ? "border-[oklch(0.72_0.13_150/0.5)] text-[oklch(0.86_0.12_150)]"
                          : "border-[oklch(0.7_0.1_240/0.5)] text-[oklch(0.82_0.09_245)]",
                      )}
                    >
                      {p.status === "paid" ? "Paid" : "Scheduled"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-foreground/80">
                    {formatMoney(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StudioPanel>
    </StudioShell>
  );
}
