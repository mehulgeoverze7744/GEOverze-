import { AlertCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";
import { selectUser, useAuthStore } from "@/stores/authStore";
import type { Json } from "@/lib/supabase/database.types";

type TabId = "members" | "library" | "quizzes" | "challenges" | "entitlements";

type MemberRow = {
  id: string;
  email: string | null;
  username: string | null;
  display_name: string | null;
  plan_tier: string;
  subscription_status: string;
  started_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  credits: number;
  solo_count: number;
  pvp_count: number;
  multiplayer_count: number;
  monthly_quiz_count: number;
  created_at: string;
};

type LibraryRow = {
  id: string;
  slug: string;
  title: string;
  min_access_tier: string | null;
  status: string;
  published_at: string | null;
  read_time_minutes: number | null;
};

type QuizAccessRow = {
  id: string;
  title: string;
  category_id: string | null;
  min_access_tier: string | null;
  access_band: string;
};

type ChallengeRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  status: string;
  min_access_tier: string;
  reward_credits: number;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "members", label: "Members" },
  { id: "library", label: "Library access" },
  { id: "quizzes", label: "Quiz access" },
  { id: "challenges", label: "Challenges" },
  { id: "entitlements", label: "Plan entitlements" },
];

type PlanEntitlementDefaults = {
  monthly: string;
  solo: string;
  pvp: string;
  multiplayer: string;
  credits: string;
  discount: string;
};

const PLAN_DEFAULTS = {
  explorer: { monthly: "", solo: "8", pvp: "1", multiplayer: "1", credits: "0", discount: "0" },
  basic: { monthly: "60", solo: "", pvp: "1", multiplayer: "1", credits: "5", discount: "300" },
  pro: { monthly: "", solo: "", pvp: "", multiplayer: "", credits: "25", discount: "1000" },
} satisfies Record<string, PlanEntitlementDefaults>;

const EXPLORER_PLAN_DEFAULTS = PLAN_DEFAULTS.explorer;

function planEntitlementDefaults(tier: string): PlanEntitlementDefaults {
  if (tier in PLAN_DEFAULTS) {
    return PLAN_DEFAULTS[tier as keyof typeof PLAN_DEFAULTS];
  }
  return EXPLORER_PLAN_DEFAULTS;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Private membership operations dashboard. Mutations go through require_admin RPCs. */
export function MembershipAdminScreen() {
  const user = useAuthStore(selectUser);
  const [adminOk, setAdminOk] = useState<boolean | null>(null);
  const [tab, setTab] = useState<TabId>("members");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [articles, setArticles] = useState<LibraryRow[]>([]);
  const [quizzes, setQuizzes] = useState<QuizAccessRow[]>([]);
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);

  const [challengeForm, setChallengeForm] = useState({
    slug: "pro-meridian-circuit",
    title: "Meridian Circuit",
    description: "A Pro-only geography circuit across meridians, coasts and capitals.",
    starts_at: new Date().toISOString().slice(0, 16),
    ends_at: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
    status: "published",
    min_access_tier: "pro",
    reward_credits: 0,
  });

  useEffect(() => {
    if (!user) {
      setAdminOk(false);
      return;
    }
    void supabase.rpc("is_admin").then(({ data, error: rpcError }) => {
      if (rpcError) {
        setAdminOk(false);
        setError(rpcError.message);
        return;
      }
      setAdminOk(Boolean(data));
    });
  }, [user]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const membershipFilters: { _tier?: string; _status?: string } = {};
      if (tierFilter !== "all") membershipFilters._tier = tierFilter;
      if (statusFilter !== "all") membershipFilters._status = statusFilter;
      const [memberRes, libraryRes, quizRes, challengeRes] = await Promise.all([
        supabase.rpc("admin_list_memberships", membershipFilters),
        supabase.rpc("admin_list_library_access"),
        (supabase.rpc as (name: string, args?: object) => ReturnType<typeof supabase.rpc>)(
          "admin_list_quiz_access",
        ),
        supabase.rpc("admin_list_membership_challenges"),
      ]);
      if (memberRes.error) throw memberRes.error;
      if (libraryRes.error) throw libraryRes.error;
      if (quizRes.error) throw quizRes.error;
      if (challengeRes.error) throw challengeRes.error;
      setMembers(asArray<MemberRow>(memberRes.data));
      setArticles(asArray<LibraryRow>(libraryRes.data));
      setQuizzes(asArray<QuizAccessRow>(quizRes.data));
      setChallenges(asArray<ChallengeRow>(challengeRes.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (adminOk) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOk, tierFilter, statusFilter]);

  const memberCounts = useMemo(() => {
    const byTier: Record<string, number> = {};
    for (const row of members) {
      byTier[row.plan_tier] = (byTier[row.plan_tier] ?? 0) + 1;
    }
    return byTier;
  }, [members]);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <ShieldAlert className="h-10 w-10 text-foreground/40" />
        <p className="text-sm text-foreground/60">Sign in to access membership admin.</p>
        <Link to="/auth/login" search={{ redirect: undefined }} className="text-sm underline">
          Sign in
        </Link>
      </div>
    );
  }

  if (adminOk === false) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <ShieldAlert className="h-10 w-10 text-foreground/40" />
        <p className="text-sm text-foreground/60">Admin role required.</p>
      </div>
    );
  }

  if (adminOk === null) {
    return <p className="p-10 text-sm text-foreground/55">Checking admin access…</p>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Membership admin</h1>
          <p className="mt-1 text-sm text-foreground/55">
            Members, Library access, challenges and plan entitlements. Changes are audited.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/geostore/admin" className="rounded-lg border border-bronze/25 px-3 py-2 text-xs font-semibold">
            Gstore orders
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-bronze/25 px-3 py-2 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              tab === item.id
                ? "border-foreground bg-foreground text-background"
                : "border-bronze/25 text-foreground/70"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "members" ? (
        <section>
          <div className="mb-4 flex flex-wrap gap-2">
            {["all", "explorer", "basic", "pro"].map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setTierFilter(tier)}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                  tierFilter === tier ? "border-foreground bg-foreground text-background" : "border-bronze/25"
                }`}
              >
                {tier}
                {tier !== "all" && memberCounts[tier] != null ? ` (${memberCounts[tier]})` : ""}
              </button>
            ))}
            {["all", "active", "cancelled", "expired", "pending", "none"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                  statusFilter === status ? "border-foreground bg-foreground text-background" : "border-bronze/25"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-bronze/20">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-charcoal/30 text-[10px] uppercase tracking-[0.16em] text-foreground/50">
                <tr>
                  <th className="px-3 py-2">Member</th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Started</th>
                  <th className="px-3 py-2">Renews</th>
                  <th className="px-3 py-2">Quizzes</th>
                  <th className="px-3 py-2">Credits</th>
                </tr>
              </thead>
              <tbody>
                {members.map((row) => (
                  <tr key={row.id} className="border-t border-bronze/15">
                    <td className="px-3 py-2">
                      <p className="font-medium">{row.display_name || row.username || "Member"}</p>
                      <p className="text-foreground/45">{row.email}</p>
                    </td>
                    <td className="px-3 py-2 uppercase">{row.plan_tier}</td>
                    <td className="px-3 py-2">
                      {row.subscription_status}
                      {row.cancel_at_period_end ? " · cancel scheduled" : ""}
                    </td>
                    <td className="px-3 py-2">{formatDate(row.started_at)}</td>
                    <td className="px-3 py-2">{formatDate(row.current_period_end)}</td>
                    <td className="px-3 py-2">
                      {row.monthly_quiz_count} ({row.solo_count}/{row.pvp_count}/{row.multiplayer_count})
                    </td>
                    <td className="px-3 py-2">{row.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "library" ? (
        <section className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bronze/20 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{article.title}</p>
                <p className="text-xs text-foreground/45">{article.slug}</p>
              </div>
              <select
                className="rounded-lg border border-bronze/25 bg-transparent px-3 py-1.5 text-xs"
                value={article.min_access_tier ?? "open"}
                onChange={async (event) => {
                  const next = event.target.value === "open" ? null : event.target.value;
                  const { error: rpcError } = await supabase.rpc("admin_set_library_resource_tier", {
                    _resource_id: article.id,
                    _min_access_tier: next,
                  });
                  if (rpcError) {
                    toast.error(rpcError.message);
                    return;
                  }
                  toast.success("Article access updated");
                  void load();
                }}
              >
                <option value="open">Open catalogue</option>
                <option value="explorer">Explorer</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro exclusive</option>
              </select>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "quizzes" ? (
        <section className="space-y-3">
          <p className="text-xs text-foreground/55">
            NULL tier = open to all published explorers. Atlases and packs default to Pro when unclassified.
          </p>
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bronze/20 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{quiz.title}</p>
                <p className="text-xs text-foreground/45">
                  {quiz.id}
                  {quiz.category_id ? ` · ${quiz.category_id}` : ""} · {quiz.access_band}
                </p>
              </div>
              <select
                className="rounded-lg border border-bronze/25 bg-transparent px-3 py-1.5 text-xs"
                value={quiz.min_access_tier ?? "open"}
                onChange={async (event) => {
                  const next = event.target.value === "open" ? null : event.target.value;
                  const { error: rpcError } = await (
                    supabase.rpc as (name: string, args?: object) => ReturnType<typeof supabase.rpc>
                  )("admin_set_quiz_access_tier", {
                    _quiz_id: quiz.id,
                    _min_access_tier: next,
                  });
                  if (rpcError) {
                    toast.error(rpcError.message);
                    return;
                  }
                  toast.success("Quiz access updated");
                  void load();
                }}
              >
                <option value="open">Open (Explorer)</option>
                <option value="explorer">Explorer catalogue</option>
                <option value="basic">Basic+</option>
                <option value="pro">Pro exclusive</option>
              </select>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "challenges" ? (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <article key={challenge.id} className="rounded-xl border border-bronze/20 p-4">
                <p className="text-[0.58rem] uppercase tracking-[0.18em] text-bronze/80">{challenge.status}</p>
                <h3 className="mt-1 text-sm font-semibold">{challenge.title}</h3>
                <p className="mt-2 text-xs text-foreground/55">{challenge.description}</p>
                <p className="mt-2 text-[11px] text-foreground/45">
                  {formatDate(challenge.starts_at)} – {formatDate(challenge.ends_at)} · reward {challenge.reward_credits}
                </p>
              </article>
            ))}
          </div>
          <form
            className="space-y-3 rounded-xl border border-bronze/20 p-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const { error: rpcError } = await supabase.rpc("admin_upsert_membership_challenge", {
                _id: crypto.randomUUID(),
                _slug: challengeForm.slug,
                _title: challengeForm.title,
                _description: challengeForm.description,
                _starts_at: new Date(challengeForm.starts_at).toISOString(),
                _ends_at: new Date(challengeForm.ends_at).toISOString(),
                _status: challengeForm.status,
                _min_access_tier: challengeForm.min_access_tier,
                _reward_credits: Number(challengeForm.reward_credits),
                _reward_config: {} as Json,
              });
              if (rpcError) {
                toast.error(rpcError.message);
                return;
              }
              toast.success("Challenge saved");
              void load();
            }}
          >
            <h3 className="text-sm font-semibold">Publish challenge</h3>
            {(["slug", "title", "description"] as const).map((field) => (
              <label key={field} className="block text-xs">
                {field}
                {field === "description" ? (
                  <textarea
                    className="mt-1 w-full rounded-lg border border-bronze/25 bg-transparent px-3 py-2"
                    value={challengeForm[field]}
                    onChange={(event) =>
                      setChallengeForm((current) => ({ ...current, [field]: event.target.value }))
                    }
                  />
                ) : (
                  <input
                    className="mt-1 w-full rounded-lg border border-bronze/25 bg-transparent px-3 py-2"
                    value={challengeForm[field]}
                    onChange={(event) =>
                      setChallengeForm((current) => ({ ...current, [field]: event.target.value }))
                    }
                  />
                )}
              </label>
            ))}
            <label className="block text-xs">
              Starts
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-bronze/25 bg-transparent px-3 py-2"
                value={challengeForm.starts_at}
                onChange={(event) =>
                  setChallengeForm((current) => ({ ...current, starts_at: event.target.value }))
                }
              />
            </label>
            <label className="block text-xs">
              Ends
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-bronze/25 bg-transparent px-3 py-2"
                value={challengeForm.ends_at}
                onChange={(event) =>
                  setChallengeForm((current) => ({ ...current, ends_at: event.target.value }))
                }
              />
            </label>
            <label className="block text-xs">
              Reward credits (0 = no payout)
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-bronze/25 bg-transparent px-3 py-2"
                value={challengeForm.reward_credits}
                onChange={(event) =>
                  setChallengeForm((current) => ({
                    ...current,
                    reward_credits: Number(event.target.value),
                  }))
                }
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background"
            >
              Save challenge
            </button>
          </form>
        </section>
      ) : null}

      {tab === "entitlements" ? (
        <EntitlementsPanel />
      ) : null}
    </main>
  );
}

function EntitlementsPanel() {
  const [tier, setTier] = useState("basic");
  const defaults = planEntitlementDefaults("basic");
  const [monthly, setMonthly] = useState(defaults.monthly);
  const [solo, setSolo] = useState(defaults.solo);
  const [pvp, setPvp] = useState(defaults.pvp);
  const [multiplayer, setMultiplayer] = useState(defaults.multiplayer);
  const [credits, setCredits] = useState(defaults.credits);
  const [rollover, setRollover] = useState("1");
  const [discount, setDiscount] = useState(defaults.discount);

  useEffect(() => {
    const next = planEntitlementDefaults(tier);
    setMonthly(next.monthly);
    setSolo(next.solo);
    setPvp(next.pvp);
    setMultiplayer(next.multiplayer);
    setCredits(next.credits);
    setDiscount(next.discount);
  }, [tier]);

  return (
    <form
      className="max-w-lg space-y-3 rounded-xl border border-bronze/20 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const { error } = await supabase.rpc("admin_update_plan_entitlements", {
          _tier: tier,
          _monthly_quiz_limit: monthly === "" ? null : Number(monthly),
          _solo_quiz_limit: solo === "" ? null : Number(solo),
          _pvp_limit: pvp === "" ? null : Number(pvp),
          _multiplayer_limit: multiplayer === "" ? null : Number(multiplayer),
          _monthly_credit_grant: Number(credits),
          _credit_rollover_months: Number(rollover),
          _gstore_discount_bps: Number(discount),
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(`Updated ${tier} entitlements`);
      }}
    >
      <p className="text-xs text-foreground/55">
        Advance cannot be activated here. Leave a quiz limit blank for unlimited.
      </p>
      <label className="block text-xs">
        Plan
        <select
          className="mt-1 w-full rounded-lg border border-bronze/25 bg-transparent px-3 py-2"
          value={tier}
          onChange={(event) => setTier(event.target.value)}
        >
          <option value="explorer">Explorer</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
        </select>
      </label>
      {[
        ["Monthly quiz limit", monthly, setMonthly],
        ["Solo quiz limit", solo, setSolo],
        ["PvP limit", pvp, setPvp],
        ["Multiplayer limit", multiplayer, setMultiplayer],
        ["Monthly credits", credits, setCredits],
        ["Rollover months", rollover, setRollover],
        ["Gstore discount bps", discount, setDiscount],
      ].map(([label, value, setter]) => (
        <label key={String(label)} className="block text-xs">
          {String(label)}
          <input
            className="mt-1 w-full rounded-lg border border-bronze/25 bg-transparent px-3 py-2"
            value={String(value)}
            onChange={(event) => (setter as (next: string) => void)(event.target.value)}
          />
        </label>
      ))}
      <button type="submit" className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background">
        Save entitlements
      </button>
    </form>
  );
}
