import { Link } from "@tanstack/react-router";
import {
  Bell,
  CreditCard,
  Database,
  Gauge,
  Globe2,
  KeyRound,
  Palette,
  Shield,
  TriangleAlert,
  User,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GeoInput, GeoSelect } from "@/components/shared/GeoField";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SettingsTile } from "@/components/shared/SettingsTile";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CREDITS, SUBSCRIPTION } from "@/features/dashboard/data/dashboard";
import { useProfile } from "@/features/profile/lib/useProfile";
import { usePreferencesStore, type ToggleKey } from "@/stores/preferencesStore";

const SECTIONS = [
  { value: "account", label: "Account", icon: User },
  { value: "profile", label: "Profile", icon: UserCircle },
  { value: "appearance", label: "Appearance", icon: Palette },
  { value: "performance", label: "Motion & performance", icon: Gauge },
  { value: "region", label: "Language & units", icon: Globe2 },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "privacy", label: "Privacy", icon: Shield },
  { value: "security", label: "Security", icon: KeyRound },
  { value: "billing", label: "Subscription", icon: CreditCard },
  { value: "data", label: "Data & danger zone", icon: Database },
] as const;

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard strong className="p-7 md:p-9">
      <h2 className="text-lg font-light tracking-tight text-foreground">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/50">{description}</p>
      <div className="mt-8 space-y-6">{children}</div>
    </GlassCard>
  );
}

/** Live switch bound to a persisted preference toggle. */
function PrefSwitch({ toggle, label }: { toggle: ToggleKey; label: string }) {
  const checked = usePreferencesStore((s) => s.toggles[toggle]);
  const setToggle = usePreferencesStore((s) => s.setToggle);
  return (
    <Switch
      checked={checked}
      onCheckedChange={(value) => setToggle(toggle, value)}
      aria-label={label}
      className="data-[state=checked]:bg-bronze/70"
    />
  );
}

const notAvailable = (what: string) =>
  toast(`${what} isn't available yet`, {
    description: "It activates once GEOverze accounts are backed by a server.",
  });

/**
 * Ten-section settings surface.
 *
 * Presentation and preference rows are fully live and persist to this device.
 * Account-bound rows show finished UI and explain what they wait on.
 */
export function SettingsPage() {
  const profile = useProfile();
  const motion = usePreferencesStore((s) => s.motion);
  const setMotion = usePreferencesStore((s) => s.setMotion);
  const units = usePreferencesStore((s) => s.units);
  const setUnits = usePreferencesStore((s) => s.setUnits);
  const locale = usePreferencesStore((s) => s.locale);
  const setLocale = usePreferencesStore((s) => s.setLocale);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Settings"
        title="Tune your universe"
        description="Presentation preferences save to this device right away. Anything account-bound activates once the backend ships."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Settings" }]}
      />

      <SectionContainer>
        <AnimatedSection>
          <Tabs
            defaultValue="account"
            orientation="vertical"
            className="gap-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start"
          >
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1.5 rounded-2xl border border-bronze/15 bg-charcoal/40 p-2 lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)] lg:flex-col lg:flex-nowrap">
              {SECTIONS.map((section) => (
                <TabsTrigger
                  key={section.value}
                  value={section.value}
                  className="w-auto justify-start gap-2.5 rounded-xl px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.18em] text-foreground/50 data-[state=active]:bg-bronze/15 data-[state=active]:text-bronze lg:w-full"
                >
                  <section.icon
                    className="h-3.5 w-3.5 shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="min-w-0">
              <TabsContent value="account">
                <Panel
                  title="Account details"
                  description="The identity behind your session. Email and password move to the server in the backend phase."
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <GeoInput id="account-email" label="Email" value={profile.email} readOnly />
                    <GeoInput
                      id="account-handle"
                      label="Username"
                      value={profile.username}
                      readOnly
                    />
                  </div>
                  <SettingsTile
                    icon={User}
                    label="Change email"
                    description="Requires confirmation from both the old and new address."
                    control={
                      <GeoButton
                        variant="secondary"
                        onClick={() => notAvailable("Changing your email")}
                      >
                        Change
                      </GeoButton>
                    }
                  />
                  <SettingsTile
                    icon={UserCircle}
                    label="Edit your explorer identity"
                    description="Display name, username, bio, country, avatar and interests."
                    control={
                      <GeoButton asChild variant="primary">
                        <Link to="/profile/edit">Open editor</Link>
                      </GeoButton>
                    }
                  />
                </Panel>
              </TabsContent>

              <TabsContent value="profile">
                <Panel
                  title="Profile presentation"
                  description="How other explorers will see you once community features open."
                >
                  <SettingsTile
                    label="Public profile"
                    description="Let other explorers view your profile, badges and progress."
                    control={<PrefSwitch toggle="publicProfile" label="Public profile" />}
                  />
                  <SettingsTile
                    label="Show me on leaderboards"
                    description="Appear in global, regional and seasonal rankings."
                    control={
                      <PrefSwitch toggle="showOnLeaderboards" label="Show me on leaderboards" />
                    }
                  />
                  <SettingsTile
                    label="Interests"
                    description={
                      profile.interests.length > 0
                        ? `${profile.interests.length} themes shape your recommendations.`
                        : "No interests chosen yet — pick a few to sharpen recommendations."
                    }
                    control={
                      <GeoButton asChild variant="secondary">
                        <Link to="/profile/edit">Adjust</Link>
                      </GeoButton>
                    }
                  />
                </Panel>
              </TabsContent>

              <TabsContent value="appearance">
                <Panel
                  title="Appearance"
                  description="GEOverze is built for one universe: deep space and bronze. You can dial the atmosphere down, not repaint it."
                >
                  <SettingsTile
                    label="Deep-space background"
                    description="Keeps the starfield behind every page. Turn off on very low-power devices."
                    control={<PrefSwitch toggle="starfield" label="Deep-space background" />}
                  />
                  <SettingsTile
                    label="Theme"
                    description="A single cinematic dark theme, tuned for contrast and long sessions."
                    control={
                      <span className="text-xs uppercase tracking-[0.2em] text-bronze/90">
                        Deep space
                      </span>
                    }
                  />
                </Panel>
              </TabsContent>

              <TabsContent value="performance">
                <Panel
                  title="Motion & performance"
                  description="Every animation respects your system setting; here you can override it either way."
                >
                  <GeoSelect
                    id="motion"
                    label="Motion"
                    hint="Reduced motion disables parallax, globe drift and reveal animations."
                    value={motion}
                    onChange={(event) => setMotion(event.target.value as typeof motion)}
                  >
                    <option value="system">Follow system</option>
                    <option value="full">Full cinematic motion</option>
                    <option value="reduced">Reduced motion</option>
                  </GeoSelect>
                  <SettingsTile
                    label="Interface sound"
                    description="Subtle cues on answers and rewards. Applies when the quiz engine ships."
                    control={<PrefSwitch toggle="soundEffects" label="Interface sound" />}
                  />
                </Panel>
              </TabsContent>

              <TabsContent value="region">
                <Panel
                  title="Language & units"
                  description="GEOverze launches in English; more languages arrive with the localisation phase."
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <GeoSelect
                      id="locale"
                      label="Language"
                      value={locale}
                      onChange={(event) => setLocale(event.target.value)}
                    >
                      <option value="en">English</option>
                    </GeoSelect>
                    <GeoSelect
                      id="units"
                      label="Measurement units"
                      value={units}
                      onChange={(event) => setUnits(event.target.value as typeof units)}
                    >
                      <option value="metric">Metric (km, °C)</option>
                      <option value="imperial">Imperial (mi, °F)</option>
                    </GeoSelect>
                  </div>
                  <SettingsTile
                    label="Country"
                    description={
                      profile.country
                        ? `Currently ${profile.country.name}. Used for regional leaderboards.`
                        : "Not set. Used for regional leaderboards only."
                    }
                    control={
                      <GeoButton asChild variant="secondary">
                        <Link to="/profile/edit">Update</Link>
                      </GeoButton>
                    }
                  />
                </Panel>
              </TabsContent>

              <TabsContent value="notifications">
                <Panel
                  title="Notifications"
                  description="Choose what reaches the notification centre and, later, your inbox."
                >
                  <SettingsTile
                    label="Season results"
                    description="Know when a season closes and where you placed."
                    control={<PrefSwitch toggle="notifySeasons" label="Season results" />}
                  />
                  <SettingsTile
                    label="New quiz packs"
                    description="A note when fresh expeditions land in Let's Play."
                    control={<PrefSwitch toggle="notifyQuizzes" label="New quiz packs" />}
                  />
                  <SettingsTile
                    label="Store activity"
                    description="Order confirmations and restocks from the GEOstore."
                    control={<PrefSwitch toggle="notifyStore" label="Store activity" />}
                  />
                  <SettingsTile
                    label="Product updates"
                    description="Occasional notes about what's new on the platform."
                    control={<PrefSwitch toggle="notifyProduct" label="Product updates" />}
                  />
                  <SettingsTile
                    label="Weekly email digest"
                    description="Your streak, progress and standings once a week. Sends once email is wired up."
                    control={<PrefSwitch toggle="notifyEmailDigest" label="Weekly email digest" />}
                  />
                  <SettingsTile
                    label="Notification centre"
                    description="Read, filter and clear everything GEOverze has sent you."
                    control={
                      <GeoButton asChild variant="secondary">
                        <Link to="/notifications">Open</Link>
                      </GeoButton>
                    }
                  />
                </Panel>
              </TabsContent>

              <TabsContent value="privacy">
                <Panel
                  title="Privacy"
                  description="You control what leaves this device and what other explorers can see."
                >
                  <SettingsTile
                    label="Anonymous analytics"
                    description="Aggregate usage only — never personal data, never sold."
                    control={<PrefSwitch toggle="analytics" label="Anonymous analytics" />}
                  />
                  <SettingsTile
                    label="Privacy policy"
                    description="How GEOverze handles the little data it holds."
                    control={
                      <GeoButton asChild variant="ghost">
                        <Link to="/privacy">Read policy</Link>
                      </GeoButton>
                    }
                  />
                </Panel>
              </TabsContent>

              <TabsContent value="security">
                <Panel
                  title="Security"
                  description="Session and credential controls. These become real with server-side authentication."
                >
                  <SettingsTile
                    icon={KeyRound}
                    label="Change password"
                    description="You will be signed out of other devices afterwards."
                    control={
                      <GeoButton
                        variant="secondary"
                        onClick={() => notAvailable("Changing your password")}
                      >
                        Change
                      </GeoButton>
                    }
                  />
                  <SettingsTile
                    icon={Shield}
                    label="Two-factor authentication"
                    description="An extra code at sign-in. Planned for the authentication backend phase."
                    control={
                      <span className="text-xs uppercase tracking-[0.2em] text-foreground/50">
                        Planned
                      </span>
                    }
                  />
                  <SettingsTile
                    label="Active sessions"
                    description="This device only, while sessions live in local storage."
                    control={
                      <span className="text-xs uppercase tracking-[0.2em] text-bronze/90">
                        1 device
                      </span>
                    }
                  />
                </Panel>
              </TabsContent>

              <TabsContent value="billing">
                <Panel
                  title="Subscription & credits"
                  description="Plans, billing and GEO credits. Payments arrive with the commerce phase."
                >
                  <SettingsTile
                    label={`Current plan — ${SUBSCRIPTION.plan}`}
                    description={SUBSCRIPTION.renewal}
                    control={
                      <GeoButton asChild variant="primary">
                        <Link to="/billing">Manage membership</Link>
                      </GeoButton>
                    }
                  />
                  <SettingsTile
                    label="Compare memberships"
                    description="Explorer, Pro and Advance side by side."
                    control={
                      <GeoButton asChild variant="secondary">
                        <Link to="/pricing/compare">Compare</Link>
                      </GeoButton>
                    }
                  />
                  <SettingsTile
                    label="GEO credits"
                    description={`${CREDITS.balance.toLocaleString()} credits · ${CREDITS.nextReward}`}
                    control={
                      <GeoButton asChild variant="secondary">
                        <Link to="/geostore">Spend</Link>
                      </GeoButton>
                    }
                  />
                  <SettingsTile
                    label="Payment methods"
                    description="No card on file — the free tier never asks for one."
                    control={
                      <GeoButton
                        variant="ghost"
                        onClick={() => notAvailable("Adding a payment method")}
                      >
                        Add
                      </GeoButton>
                    }
                  />
                </Panel>
              </TabsContent>

              <TabsContent value="data">
                <Panel
                  title="Data & danger zone"
                  description="Export or erase everything GEOverze keeps about you. Destructive actions always confirm first."
                >
                  <SettingsTile
                    icon={Database}
                    label="Export my data"
                    description="A single JSON file with your profile, progress and preferences."
                    control={
                      <GeoButton variant="secondary" onClick={() => notAvailable("Data export")}>
                        Export
                      </GeoButton>
                    }
                  />
                  <SettingsTile
                    icon={TriangleAlert}
                    tone="danger"
                    label="Delete account"
                    description="Removes your profile, progress and collections permanently. There is no undo."
                    control={
                      <GeoButton
                        variant="secondary"
                        className="border-destructive/40 text-destructive/90 hover:border-destructive/70"
                        onClick={() => notAvailable("Account deletion")}
                      >
                        Delete
                      </GeoButton>
                    }
                  />
                </Panel>
              </TabsContent>
            </div>
          </Tabs>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
