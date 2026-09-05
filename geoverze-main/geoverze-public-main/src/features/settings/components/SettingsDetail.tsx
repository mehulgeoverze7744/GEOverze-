import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Database, Lock, LockKeyhole, Mail, Shield, TriangleAlert, User } from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { SUBSCRIPTION } from "@/features/dashboard/data/dashboard";
import { useProfile } from "@/features/profile/lib/useProfile";
import { notAvailable, PrefSwitch } from "@/features/settings/lib/settingsControls";
import {
  MOTION_LABELS,
  SECTION_DESCRIPTIONS,
  SECTION_TITLES,
  type SettingsSection,
} from "@/features/settings/lib/settingsSections";
import { cn } from "@/lib/utils";
import { useProgressionStore } from "@/stores/progressionStore";
import {
  usePreferencesStore,
  type MotionPreference,
  type UnitSystem,
} from "@/stores/preferencesStore";

import { SettingsGroup, SettingsRow } from "./SettingsRow";

type SettingsDetailProps = {
  section: SettingsSection;
};

/** Focused detail view for one settings category. */
export function SettingsDetail({ section }: SettingsDetailProps) {
  const navigate = useNavigate({ from: "/settings" });
  const profile = useProfile();
  const walletBalance = useProgressionStore((s) => s.player.credits);
  const motion = usePreferencesStore((s) => s.motion);
  const setMotion = usePreferencesStore((s) => s.setMotion);
  const units = usePreferencesStore((s) => s.units);
  const setUnits = usePreferencesStore((s) => s.setUnits);
  const locale = usePreferencesStore((s) => s.locale);

  const back = () => {
    void navigate({ search: { section: undefined } });
  };

  return (
    <AnimatedSection>
      <button type="button" onClick={back} className="settings-back">
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        Settings
      </button>

      <header className="settings-header">
        <h1 className="settings-title">{SECTION_TITLES[section]}</h1>
        <p className="settings-description">{SECTION_DESCRIPTIONS[section]}</p>
      </header>

      <div className="settings-detail-panel">
        {section === "account" ? <AccountPanel profile={profile} /> : null}
        {section === "profile" ? <ProfilePanel profile={profile} /> : null}
        {section === "appearance" ? <AppearancePanel /> : null}
        {section === "performance" ? (
          <PerformancePanel motion={motion} setMotion={setMotion} />
        ) : null}
        {section === "region" ? (
          <RegionPanel locale={locale} units={units} setUnits={setUnits} profile={profile} />
        ) : null}
        {section === "notifications" ? <NotificationsPanel /> : null}
        {section === "privacy" ? <PrivacyPanel /> : null}
        {section === "security" ? <SecurityPanel profile={profile} /> : null}
        {section === "billing" ? <BillingPanel walletBalance={walletBalance} /> : null}
        {section === "data" ? <DataPanel /> : null}
      </div>
    </AnimatedSection>
  );
}

function AccountPanel({ profile }: { profile: ReturnType<typeof useProfile> }) {
  return (
    <>
      <SettingsGroup label="Details">
        <SettingsRow icon={Mail} title="Email" subtitle={profile.email} static />
        <SettingsRow icon={User} title="Username" subtitle={`@${profile.username}`} static />
      </SettingsGroup>
      <SettingsGroup label="Actions">
        <SettingsRow
          title="Change email"
          subtitle="Requires confirmation from both the old and new address."
          control={
            <button
              type="button"
              className="settings-inline-action"
              onClick={() => notAvailable("Changing your email")}
            >
              Change
            </button>
          }
          static
        />
        <SettingsRow
          title="Edit explorer identity"
          subtitle="Display name, username, bio, country, avatar and interests."
          control={
            <GeoButton asChild variant="secondary" size="sm">
              <Link to="/profile/edit">Open editor</Link>
            </GeoButton>
          }
          static
        />
      </SettingsGroup>
    </>
  );
}

function ProfilePanel({ profile }: { profile: ReturnType<typeof useProfile> }) {
  return (
    <SettingsGroup label="Visibility">
      <SettingsRow
        title="Public profile"
        subtitle="Let other explorers view your profile, badges and progress."
        control={<PrefSwitch toggle="publicProfile" label="Public profile" />}
        static
      />
      <SettingsRow
        title="Show me on leaderboards"
        subtitle="Appear in global, regional and seasonal rankings."
        control={<PrefSwitch toggle="showOnLeaderboards" label="Show me on leaderboards" />}
        static
      />
      <SettingsRow
        title="Interests"
        subtitle={
          profile.interests.length > 0
            ? `${profile.interests.length} themes shape your recommendations.`
            : "Pick a few to sharpen recommendations."
        }
        control={
          <GeoButton asChild variant="secondary" size="sm">
            <Link to="/profile/edit">Adjust</Link>
          </GeoButton>
        }
        static
      />
    </SettingsGroup>
  );
}

function AppearancePanel() {
  return (
    <>
      <p className="settings-detail-intro">
        GEOverze is built for deep space and bronze. You can dial the atmosphere down, not repaint
        it.
      </p>
      <SettingsGroup label="Theme">
        <SettingsRow title="Theme" value="Deep space" static />
        <SettingsRow title="Accent" value="Bronze" static />
      </SettingsGroup>
      <SettingsGroup label="Atmosphere">
        <SettingsRow
          title="Background atmosphere"
          subtitle="Keeps the starfield behind every page. Turn off on very low-power devices."
          control={<PrefSwitch toggle="starfield" label="Deep-space background" />}
          static
        />
      </SettingsGroup>
    </>
  );
}

function PerformancePanel({
  motion,
  setMotion,
}: {
  motion: MotionPreference;
  setMotion: (value: MotionPreference) => void;
}) {
  const options: MotionPreference[] = ["system", "full", "reduced"];

  return (
    <>
      <p className="settings-detail-intro">
        Every animation respects your system setting; here you can override it either way.
      </p>
      <div>
        <p className="settings-subgroup-label">Motion</p>
        <div className="settings-group">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              data-selected={motion === option}
              onClick={() => setMotion(option)}
              className="settings-option-row"
            >
              {MOTION_LABELS[option]}
              <span className="settings-option-dot" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <SettingsGroup label="Sound">
        <SettingsRow
          title="Interface sound"
          subtitle="Subtle cues on answers and rewards. Applies when the quiz engine ships."
          control={<PrefSwitch toggle="soundEffects" label="Interface sound" />}
          static
        />
      </SettingsGroup>
    </>
  );
}

function RegionPanel({
  locale,
  units,
  setUnits,
  profile,
}: {
  locale: string;
  units: UnitSystem;
  setUnits: (value: UnitSystem) => void;
  profile: ReturnType<typeof useProfile>;
}) {
  const unitOptions: UnitSystem[] = ["metric", "imperial"];

  return (
    <>
      <p className="settings-detail-intro">
        GEOverze launches in English; more languages arrive with the localisation phase.
      </p>
      <SettingsGroup label="Language">
        <SettingsRow title="Language" value={LOCALE_LABELS[locale] ?? locale} static />
      </SettingsGroup>
      <div>
        <p className="settings-subgroup-label">Distance & temperature</p>
        <div className="settings-group">
          {unitOptions.map((option) => (
            <button
              key={option}
              type="button"
              data-selected={units === option}
              onClick={() => setUnits(option)}
              className="settings-option-row"
            >
              {option === "metric" ? "Metric (km, °C)" : "Imperial (mi, °F)"}
              <span className="settings-option-dot" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <SettingsGroup label="Region">
        <SettingsRow
          title="Country"
          subtitle={
            profile.country
              ? `Currently ${profile.country.name}. Used for regional leaderboards.`
              : "Not set. Used for regional leaderboards only."
          }
          control={
            <GeoButton asChild variant="secondary" size="sm">
              <Link to="/profile/edit">Update</Link>
            </GeoButton>
          }
          static
        />
      </SettingsGroup>
    </>
  );
}

function NotificationsPanel() {
  return (
    <SettingsGroup label="Preferences">
      <SettingsRow
        title="Season results"
        subtitle="Know when a season closes and where you placed."
        control={<PrefSwitch toggle="notifySeasons" label="Season results" />}
        static
      />
      <SettingsRow
        title="New quiz packs"
        subtitle="A note when fresh expeditions land in Let's Play."
        control={<PrefSwitch toggle="notifyQuizzes" label="New quiz packs" />}
        static
      />
      <SettingsRow
        title="Store activity"
        subtitle="Order confirmations and restocks from the GEOstore."
        control={<PrefSwitch toggle="notifyStore" label="Store activity" />}
        static
      />
      <SettingsRow
        title="Product updates"
        subtitle="Occasional notes about what's new on the platform."
        control={<PrefSwitch toggle="notifyProduct" label="Product updates" />}
        static
      />
      <SettingsRow
        title="Weekly email digest"
        subtitle="Your streak, progress and standings once a week."
        control={<PrefSwitch toggle="notifyEmailDigest" label="Weekly email digest" />}
        static
      />
      <SettingsRow
        title="Notification centre"
        subtitle="Read, filter and clear everything GEOverze has sent you."
        control={
          <GeoButton asChild variant="secondary" size="sm">
            <Link to="/notifications">Open</Link>
          </GeoButton>
        }
        static
      />
    </SettingsGroup>
  );
}

function PrivacyPanel() {
  return (
    <SettingsGroup label="Data & visibility">
      <SettingsRow
        title="Anonymous analytics"
        subtitle="Aggregate usage only — never personal data, never sold."
        control={<PrefSwitch toggle="analytics" label="Anonymous analytics" />}
        static
      />
      <SettingsRow
        title="Privacy policy"
        subtitle="How GEOverze handles the little data it holds."
        control={
          <GeoButton asChild variant="ghost" size="sm">
            <Link to="/privacy">Read</Link>
          </GeoButton>
        }
        static
      />
    </SettingsGroup>
  );
}

function SecurityPanel({ profile }: { profile: ReturnType<typeof useProfile> }) {
  return (
    <>
      <SettingsGroup label="Credentials">
        <SettingsRow icon={Mail} title="Email" subtitle={profile.email} static />
        <SettingsRow
          icon={Lock}
          title="Change password"
          subtitle="You will be signed out of other devices afterwards."
          control={
            <button
              type="button"
              className="settings-inline-action"
              onClick={() => notAvailable("Changing your password")}
            >
              Change
            </button>
          }
          static
        />
      </SettingsGroup>
      <SettingsGroup label="Protection">
        <SettingsRow
          icon={LockKeyhole}
          title="Two-factor authentication"
          subtitle="An extra code at sign-in. Planned for the authentication backend phase."
          value="Planned"
          static
        />
        <SettingsRow
          title="Active sessions"
          subtitle="This device only, while sessions live in local storage."
          value="1 device"
          static
        />
      </SettingsGroup>
    </>
  );
}

function BillingPanel({ walletBalance }: { walletBalance: number }) {
  return (
    <>
      <SettingsGroup label="Plan">
        <SettingsRow
          title="Current plan"
          subtitle={SUBSCRIPTION.renewal}
          value={SUBSCRIPTION.plan}
          static
        />
        <SettingsRow
          title="Manage membership"
          subtitle="View plan details and billing options."
          control={
            <GeoButton asChild variant="primary" size="sm">
              <Link to="/billing">Manage</Link>
            </GeoButton>
          }
          static
        />
        <SettingsRow
          title="Compare memberships"
          subtitle="Explorer, Pro and Advance side by side."
          control={
            <GeoButton asChild variant="secondary" size="sm">
              <Link to="/pricing/compare">Compare</Link>
            </GeoButton>
          }
          static
        />
      </SettingsGroup>
      <SettingsGroup label="Credits">
        <SettingsRow
          title="GEO credits"
          subtitle={`${walletBalance.toLocaleString()} credits available in your wallet`}
          control={
            <GeoButton asChild variant="secondary" size="sm">
              <Link to="/geostore">Spend</Link>
            </GeoButton>
          }
          static
        />
        <SettingsRow
          title="Payment methods"
          subtitle="No card on file — the free tier never asks for one."
          control={
            <button
              type="button"
              className="settings-inline-action"
              onClick={() => notAvailable("Adding a payment method")}
            >
              Add
            </button>
          }
          static
        />
      </SettingsGroup>
    </>
  );
}

function DataPanel() {
  return (
    <>
      <SettingsGroup label="Your data">
        <SettingsRow
          icon={Database}
          title="Export my data"
          subtitle="A single JSON file with your profile, progress and preferences."
          control={
            <button
              type="button"
              className="settings-inline-action"
              onClick={() => notAvailable("Data export")}
            >
              Export
            </button>
          }
          static
        />
      </SettingsGroup>
      <section>
        <h2 className="settings-group-label">Danger zone</h2>
        <div className={cn("settings-group", "settings-danger-zone")}>
          <SettingsRow
            icon={TriangleAlert}
            title="Delete account"
            subtitle="Removes your profile, progress and collections permanently. There is no undo."
            control={
              <button
                type="button"
                className="settings-inline-action settings-inline-action--danger"
                onClick={() => notAvailable("Account deletion")}
              >
                Delete
              </button>
            }
            static
            danger
          />
        </div>
      </section>
    </>
  );
}
