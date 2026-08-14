import { BadgeCheck, Bell, CreditCard, Globe, ShieldCheck, User } from "lucide-react";
import { useState } from "react";

import { GeoButton } from "@/components/shared/GeoButton";
import { GeoInput, GeoTextarea } from "@/components/shared/GeoField";
import { cn } from "@/lib/utils";
import { CREATOR } from "../data/creator";
import { StudioHeader, StudioShell } from "../components/StudioShell";
import { StudioPanel, StudioPanelHeader } from "../components/StudioPanel";
import { formatDate } from "../lib/format";

const TABS = [
  { id: "profile", label: "Creator profile", icon: User },
  { id: "verification", label: "Verification", icon: BadgeCheck },
  { id: "payouts", label: "Payouts", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "publishing", label: "Publishing", icon: Globe },
] as const;

type TabId = (typeof TABS)[number]["id"];

const NOTIFICATION_ROWS = [
  { id: "n1", label: "Review decisions", hint: "When a submission is approved or rejected" },
  { id: "n2", label: "Milestones", hint: "Play counts, follower thresholds, featured placements" },
  { id: "n3", label: "Comments and questions", hint: "Replies on your quizzes and articles" },
  { id: "n4", label: "Payout events", hint: "Cleared balances and completed transfers" },
  { id: "n5", label: "Product updates", hint: "New studio features and question types" },
];

/** Studio settings. Fields are interactive but nothing persists to a server. */
export function StudioSettingsScreen() {
  const [tab, setTab] = useState<TabId>("profile");
  const [bio, setBio] = useState(CREATOR.bio);
  const [name, setName] = useState(CREATOR.name);
  const [handle, setHandle] = useState(CREATOR.handle);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    n1: true,
    n2: true,
    n3: true,
    n4: true,
    n5: false,
  });

  return (
    <StudioShell>
      <StudioHeader
        eyebrow="Business"
        title="Studio settings"
        description="Your public creator identity, verification status, payout details and notification preferences."
        actions={
          <GeoButton size="sm" variant="primary" disabled>
            Save changes
          </GeoButton>
        }
      />

      <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections">
          <ul className="space-y-1">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[0.82rem] transition-colors",
                    tab === t.id
                      ? "bg-bronze/12 text-bronze-glow"
                      : "text-foreground/55 hover:bg-bronze/[0.06] hover:text-foreground",
                  )}
                >
                  <t.icon className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          {tab === "profile" ? (
            <StudioPanel>
              <StudioPanelHeader
                title="Creator profile"
                hint="Shown on your public GEOlibrary and Community pages"
              />
              <div className="grid gap-4 [&>*]:min-w-0 md:grid-cols-2">
                <GeoInput
                  id="creator-name"
                  label="Display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <GeoInput
                  id="creator-handle"
                  label="Handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
                <GeoTextarea
                  id="creator-bio"
                  label="Bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  wrapperClassName="md:col-span-2"
                />
                <GeoInput id="creator-location" label="Location" defaultValue={CREATOR.location} />
                <GeoInput
                  id="creator-languages"
                  label="Languages"
                  defaultValue={CREATOR.languages.join(", ")}
                />
              </div>

              <div className="mt-5 border-t border-bronze/12 pt-4">
                <p className="mb-2.5 text-[0.68rem] uppercase tracking-[0.16em] text-foreground/50">
                  Links
                </p>
                <ul className="space-y-2">
                  {CREATOR.social.map((link) => (
                    <li key={link.label} className="flex items-center gap-3 text-[0.8rem]">
                      <span className="w-20 shrink-0 text-foreground/50">{link.label}</span>
                      <span className="truncate text-foreground/75">{link.url}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </StudioPanel>
          ) : null}

          {tab === "verification" ? (
            <StudioPanel>
              <StudioPanelHeader
                title="Verification"
                hint="Verified creators can publish directly into GEOlibrary shelves"
              />
              <div className="flex items-start gap-3 rounded-lg border border-[oklch(0.72_0.13_150/0.35)] bg-[oklch(0.72_0.13_150/0.08)] p-4">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.86_0.12_150)]"
                  strokeWidth={1.9}
                  aria-hidden
                />
                <div>
                  <p className="text-[0.88rem] font-medium text-foreground/90">
                    Verified since {formatDate(CREATOR.joinedAt)}
                  </p>
                  <p className="mt-1 text-[0.8rem] text-foreground/50">
                    {CREATOR.role}. Specialities: {CREATOR.specialities.join(", ")}.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[0.8rem] leading-relaxed text-foreground/50">
                Verification reviews credentials, sourcing standards and content history. Renewal is
                annual and handled by the GEOverze content team.
              </p>
            </StudioPanel>
          ) : null}

          {tab === "payouts" ? (
            <StudioPanel>
              <StudioPanelHeader title="Payouts" hint="Placeholder — no processor connected" />
              <dl className="space-y-3 text-[0.82rem]">
                <div className="flex justify-between border-b border-bronze/[0.07] pb-3">
                  <dt className="text-foreground/50">Method</dt>
                  <dd className="text-foreground/85">{CREATOR.payout.method}</dd>
                </div>
                <div className="flex justify-between border-b border-bronze/[0.07] pb-3">
                  <dt className="text-foreground/50">Destination</dt>
                  <dd className="text-foreground/85">{CREATOR.payout.detail}</dd>
                </div>
                <div className="flex justify-between border-b border-bronze/[0.07] pb-3">
                  <dt className="text-foreground/50">Currency</dt>
                  <dd className="text-foreground/85">{CREATOR.payout.currency}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foreground/50">Schedule</dt>
                  <dd className="text-foreground/85">Monthly, on the 15th</dd>
                </div>
              </dl>
              <GeoButton size="sm" variant="secondary" className="mt-5" disabled>
                Connect payout account
              </GeoButton>
            </StudioPanel>
          ) : null}

          {tab === "notifications" ? (
            <StudioPanel>
              <StudioPanelHeader title="Notifications" hint="Where studio alerts reach you" />
              <ul className="divide-y divide-bronze/[0.07]">
                {NOTIFICATION_ROWS.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <p className="text-[0.85rem] text-foreground/85">{row.label}</p>
                      <p className="mt-0.5 text-[0.75rem] text-foreground/50">{row.hint}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={toggles[row.id] ?? false}
                      aria-label={`Toggle ${row.label}`}
                      onClick={() => setToggles((t) => ({ ...t, [row.id]: !t[row.id] }))}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full border transition-colors motion-fast",
                        toggles[row.id]
                          ? "border-bronze/60 bg-bronze/30"
                          : "border-foreground/15 bg-foreground/[0.06]",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-foreground/85 transition-transform motion-fast",
                          toggles[row.id] ? "translate-x-5.5" : "translate-x-0.5",
                        )}
                        style={{ height: "1.1rem", width: "1.1rem" }}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </StudioPanel>
          ) : null}

          {tab === "publishing" ? (
            <StudioPanel>
              <StudioPanelHeader
                title="Publishing defaults"
                hint="Applied to every new quiz and article"
              />
              <div className="grid gap-4 [&>*]:min-w-0 md:grid-cols-2">
                <GeoInput id="pub-language" label="Default language" defaultValue="English" />
                <GeoInput
                  id="pub-licence"
                  label="Content licence"
                  defaultValue="GEOverze standard"
                />
                <GeoInput
                  id="pub-attribution"
                  label="Attribution name"
                  defaultValue={CREATOR.name}
                />
                <GeoInput id="pub-visibility" label="Default visibility" defaultValue="Draft" />
              </div>
              <p className="mt-4 text-[0.8rem] leading-relaxed text-foreground/50">
                Review turnaround is typically 48 hours. Submissions are checked for sourcing,
                factual accuracy and accessibility before they reach players.
              </p>
            </StudioPanel>
          ) : null}
        </div>
      </div>
    </StudioShell>
  );
}
