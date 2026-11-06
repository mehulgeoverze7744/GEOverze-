/**
 * GstorePaymentAdminScreen — /geostore/admin/payments
 *
 * Admin dashboard for unified payment infrastructure management.
 * Shows:
 *   - Active payment providers and their configuration
 *   - Enabled currencies and their status
 *   - Shipping zones
 *   - Payment audit log (recent events)
 *   - Feature flags (read-only display — changes require code + deployment)
 *
 * Access is controlled by GSTORE_ADMIN_EMAILS env var (server-side).
 */

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";
import { selectUser, useAuthStore } from "@/stores/authStore";
import {
  getAdminPaymentConfigFn,
  getAdminPaymentAuditLogFn,
  type PaymentInfraConfig,
} from "@/lib/payments/paymentServerFns";
import { StorefrontNav } from "../storefront/StorefrontNav";
import "../storefront/storefront.css";

// ── Types ─────────────────────────────────────────────────────────────────────

type ProviderRow = {
  id: string;
  name: string;
  enabled: boolean;
  supports_one_time: boolean;
  supports_subscriptions: boolean;
  supported_countries: string[];
  supported_currencies: string[];
  priority: number;
  admin_note: string;
  activated_at?: string;
  activated_by?: string;
};

type CurrencyRow = {
  code: string;
  name: string;
  symbol: string;
  minor_unit_factor: number;
  decimal_places: number;
  enabled: boolean;
  disabled_reason?: string;
};

type ShippingZoneRow = {
  id: string;
  name: string;
  countries: string[];
  currency_code: string;
  enabled: boolean;
  disabled_reason?: string;
  free_shipping_threshold_minor: number;
};

type AuditLogRow = {
  id: string;
  event: string;
  provider: string;
  billing_type: string;
  purpose: string;
  amount_minor?: number;
  currency?: string;
  order_id?: string;
  success: boolean;
  error?: string;
  created_at: string;
};

// ── Status badge ──────────────────────────────────────────────────────────────

function EnabledBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
      <CheckCircle2 className="h-3 w-3" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
      <XCircle className="h-3 w-3" /> Inactive
    </span>
  );
}

function SuccessBadge({ success }: { success: boolean }) {
  return success ? (
    <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">✓</span>
  ) : (
    <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">✗</span>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-black">{title}</h2>
          {subtitle && <p className="text-[12px] text-[#777]">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function GstorePaymentAdminScreen() {
  const user = useAuthStore(selectUser);

  const [accessToken, setAccessToken]   = useState<string | null>(null);
  const [config, setConfig]             = useState<Awaited<ReturnType<typeof getAdminPaymentConfigFn>> | null>(null);
  const [auditLogs, setAuditLogs]       = useState<AuditLogRow[]>([]);
  const [loading, setLoading]           = useState(false);
  const [logsLoading, setLogsLoading]   = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [openSection, setOpenSection]   = useState<string | null>("providers");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) setAccessToken(data.session.access_token);
    });
  }, []);

  async function loadConfig(tok = accessToken) {
    if (!tok) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminPaymentConfigFn({ data: { access_token: tok } });
      setConfig(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }

  async function loadAuditLogs(tok = accessToken) {
    if (!tok) return;
    setLogsLoading(true);
    try {
      const result = await getAdminPaymentAuditLogFn({
        data: { access_token: tok, limit: 100 },
      });
      setAuditLogs(result.logs as AuditLogRow[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load audit log");
    } finally {
      setLogsLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) {
      void loadConfig(accessToken);
      void loadAuditLogs(accessToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (!user) {
    return (
      <div id="gvrze-storefront">
        <StorefrontNav variant="solid" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <ShieldAlert className="h-10 w-10 text-[#999]" />
          <p className="text-[16px] text-[#555]">Sign in to access the admin panel.</p>
          <Link to="/auth" className="text-sm font-medium underline">Sign in</Link>
        </div>
      </div>
    );
  }

  const providers   = (config?.providers ?? []) as ProviderRow[];
  const currencies  = (config?.currencies ?? []) as CurrencyRow[];
  const zones       = (config?.zones ?? []) as ShippingZoneRow[];
  const mockEnabled = config?.mockEnabled ?? false;

  function toggleSection(id: string) {
    setOpenSection(v => v === id ? null : id);
  }

  return (
    <div id="gvrze-storefront" className="gvrze-storefront-product">
      <StorefrontNav variant="solid" />

      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-bold text-black">Payment Infrastructure</h1>
              <p className="text-[13px] text-[#777] mt-0.5">Provider configuration, currencies, shipping zones, audit log</p>
            </div>
            <div className="flex items-center gap-2">
              {mockEnabled && (
                <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                  ⚗️ MOCK MODE ACTIVE
                </span>
              )}
              <button
                onClick={() => { void loadConfig(); void loadAuditLogs(); }}
                disabled={loading}
                className="flex items-center gap-1.5 border border-[#ddd] bg-white px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-[#f5f5f5] disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-[13px] text-red-700">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Access denied or configuration error</p>
                <p className="text-[12px] mt-0.5">{error}</p>
                <p className="text-[11px] mt-1 text-red-500">
                  Your email must be listed in the GSTORE_ADMIN_EMAILS environment variable.
                </p>
              </div>
            </div>
          )}

          {/* ── Payment Providers ── */}
          <section className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
            <button
              onClick={() => toggleSection("providers")}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-[#555]" />
                <div>
                  <span className="font-bold text-[14px] text-black">Payment Providers</span>
                  <span className="ml-2 text-[12px] text-[#777]">
                    {providers.filter(p => p.enabled).length} active
                  </span>
                </div>
              </div>
              {openSection === "providers" ? <ChevronDown className="h-4 w-4 text-[#999]" /> : <ChevronRight className="h-4 w-4 text-[#999]" />}
            </button>

            {openSection === "providers" && (
              <div className="p-6 space-y-4">
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5 text-[12px] text-blue-700">
                  ℹ️ To activate or deactivate a provider, update <code className="font-mono bg-blue-100 px-1 rounded">config.ts</code> and redeploy. Provider activation requires business owner approval.
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#ddd] border-t-black" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {providers.map(p => (
                      <div key={p.id} className="rounded-xl border border-[#e8e8e8] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[14px] text-black">{p.name}</span>
                              <span className="font-mono text-[11px] text-[#777] bg-[#f0f0f0] px-1.5 py-0.5 rounded">{p.id}</span>
                              <EnabledBadge enabled={p.enabled} />
                              {p.id === "mock" && mockEnabled && (
                                <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">ENV ACTIVE</span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[#777]">
                              <span>Priority: {p.priority}</span>
                              <span>· One-time: {p.supports_one_time ? "✓" : "✗"}</span>
                              <span>· Subscriptions: {p.supports_subscriptions ? "✓" : "✗"}</span>
                              <span>· Countries: {p.supported_countries.join(", ")}</span>
                              <span>· Currencies: {p.supported_currencies.join(", ")}</span>
                            </div>
                            {p.admin_note && (
                              <p className="mt-1.5 text-[11px] text-[#999] italic">{p.admin_note}</p>
                            )}
                            {p.activated_at && (
                              <p className="mt-1 text-[10px] text-[#aaa]">
                                Activated: {new Date(p.activated_at).toLocaleDateString()} by {p.activated_by}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Currencies ── */}
          <section className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
            <button
              onClick={() => toggleSection("currencies")}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-[#555]" />
                <div>
                  <span className="font-bold text-[14px] text-black">Currencies</span>
                  <span className="ml-2 text-[12px] text-[#777]">
                    {currencies.filter(c => c.enabled).length} enabled
                  </span>
                </div>
              </div>
              {openSection === "currencies" ? <ChevronDown className="h-4 w-4 text-[#999]" /> : <ChevronRight className="h-4 w-4 text-[#999]" />}
            </button>

            {openSection === "currencies" && (
              <div className="p-6 space-y-4">
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-[12px] text-amber-800">
                  ⚠️ Enabling a new currency requires: gateway support verified, tax review complete, currency-specific product prices added, international shipping configured, and business owner approval.
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[12px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#eee] text-[11px] text-[#777] text-left">
                        <th className="py-2 pr-4">Currency</th>
                        <th className="py-2 pr-4">Symbol</th>
                        <th className="py-2 pr-4">Minor Units</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {currencies.map(c => (
                        <tr key={c.code}>
                          <td className="py-2.5 pr-4 font-mono font-bold text-black">{c.code}</td>
                          <td className="py-2.5 pr-4 text-[#555]">{c.symbol} · {c.name}</td>
                          <td className="py-2.5 pr-4 text-[#777]">{c.decimal_places} dp (÷{c.minor_unit_factor})</td>
                          <td className="py-2.5 pr-4"><EnabledBadge enabled={c.enabled} /></td>
                          <td className="py-2.5 text-[#aaa] text-[11px]">{c.disabled_reason ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* ── Shipping Zones ── */}
          <section className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
            <button
              onClick={() => toggleSection("shipping")}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#555]" />
                <div>
                  <span className="font-bold text-[14px] text-black">Shipping Zones</span>
                  <span className="ml-2 text-[12px] text-[#777]">
                    {zones.filter(z => z.enabled).length} active
                  </span>
                </div>
              </div>
              {openSection === "shipping" ? <ChevronDown className="h-4 w-4 text-[#999]" /> : <ChevronRight className="h-4 w-4 text-[#999]" />}
            </button>

            {openSection === "shipping" && (
              <div className="p-6 space-y-3">
                {zones.map(z => (
                  <div key={z.id} className="rounded-xl border border-[#e8e8e8] p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[13px] text-black">{z.name}</span>
                      <span className="font-mono text-[11px] text-[#777] bg-[#f0f0f0] px-1.5 py-0.5 rounded">{z.id}</span>
                      <EnabledBadge enabled={z.enabled} />
                    </div>
                    <div className="mt-1.5 text-[11px] text-[#777] flex flex-wrap gap-3">
                      <span>Countries: {z.countries.join(", ")}</span>
                      <span>· Currency: {z.currency_code}</span>
                      {z.free_shipping_threshold_minor > 0 && (
                        <span>· Free shipping threshold: {z.currency_code} {(z.free_shipping_threshold_minor / 100).toFixed(0)}</span>
                      )}
                    </div>
                    {!z.enabled && z.disabled_reason && (
                      <p className="mt-1 text-[11px] text-[#aaa] italic">{z.disabled_reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Feature Flags ── */}
          <section className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
            <button
              onClick={() => toggleSection("flags")}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#555]" />
                <span className="font-bold text-[14px] text-black">Feature Flags</span>
              </div>
              {openSection === "flags" ? <ChevronDown className="h-4 w-4 text-[#999]" /> : <ChevronRight className="h-4 w-4 text-[#999]" />}
            </button>

            {openSection === "flags" && config && (
              <div className="p-6">
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-[12px] text-zinc-600 mb-4">
                  Feature flags are configured in <code className="font-mono bg-zinc-100 px-1 rounded">src/lib/payments/config.ts</code>. Changes require a redeployment.
                </div>
                <div className="space-y-2">
                  {Object.entries(config.featureFlags ?? {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0">
                      <span className="font-mono text-[12px] text-black">{key}</span>
                      <EnabledBadge enabled={value as boolean} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── Audit Log ── */}
          <section className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
            <button
              onClick={() => toggleSection("audit")}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#555]" />
                <div>
                  <span className="font-bold text-[14px] text-black">Payment Audit Log</span>
                  <span className="ml-2 text-[12px] text-[#777]">Last 100 events</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); void loadAuditLogs(); }}
                  disabled={logsLoading}
                  className="flex items-center gap-1 text-[11px] text-[#777] hover:text-black border border-[#ddd] px-2 py-1 rounded-lg"
                >
                  <RefreshCw className={`h-3 w-3 ${logsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                {openSection === "audit" ? <ChevronDown className="h-4 w-4 text-[#999]" /> : <ChevronRight className="h-4 w-4 text-[#999]" />}
              </div>
            </button>

            {openSection === "audit" && (
              <div className="overflow-x-auto">
                {logsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#ddd] border-t-black" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="py-10 text-center text-[13px] text-[#aaa]">No audit log entries yet.</div>
                ) : (
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#eee] text-[10px] text-[#777] text-left bg-[#fafafa]">
                        <th className="px-4 py-2">Time</th>
                        <th className="px-4 py-2">Event</th>
                        <th className="px-4 py-2">Provider</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Order</th>
                        <th className="px-4 py-2">OK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f5]">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-[#fafafa]">
                          <td className="px-4 py-2 text-[#999] whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString("en-IN", {
                              dateStyle: "short", timeStyle: "short"
                            })}
                          </td>
                          <td className="px-4 py-2 font-mono text-black">{log.event}</td>
                          <td className="px-4 py-2 text-[#555]">{log.provider}</td>
                          <td className="px-4 py-2 text-[#777]">{log.billing_type}</td>
                          <td className="px-4 py-2 text-[#555]">
                            {log.amount_minor && log.currency
                              ? `${log.currency} ${(log.amount_minor / 100).toFixed(2)}`
                              : "—"
                            }
                          </td>
                          <td className="px-4 py-2 font-mono text-[9px] text-[#aaa]">
                            {log.order_id ? log.order_id.slice(0, 8) + "…" : "—"}
                          </td>
                          <td className="px-4 py-2">
                            <SuccessBadge success={log.success} />
                            {log.error && (
                              <span className="ml-1 text-[10px] text-red-500" title={log.error}>!</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>

          {/* Nav links */}
          <div className="flex gap-4 justify-center">
            <Link to="/geostore/admin" className="text-[12px] text-[#777] hover:text-black underline">
              ← Order Management
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
