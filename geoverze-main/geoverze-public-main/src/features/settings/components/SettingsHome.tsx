import { useNavigate } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SUBSCRIPTION } from "@/features/dashboard/data/dashboard";
import { LOCALE_LABELS, type SettingsSection } from "@/features/settings/lib/settingsSections";
import { usePreferencesStore } from "@/stores/preferencesStore";

import { SettingsGroup, SettingsRow } from "./SettingsRow";

/** Settings landing — grouped product-style navigation. */
export function SettingsHome() {
  const navigate = useNavigate({ from: "/settings" });
  const locale = usePreferencesStore((s) => s.locale);

  const open = (section: SettingsSection) => {
    void navigate({ search: { section } });
  };

  return (
    <AnimatedSection className="settings-groups">
      <SettingsGroup label="Account">
        <SettingsRow
          icon="👤"
          title="Profile"
          subtitle="Your name, avatar and personal information"
          onClick={() => open("profile")}
        />
        <SettingsRow
          icon="📧"
          title="Email"
          subtitle="Manage your account email address"
          onClick={() => open("account")}
        />
        <SettingsRow
          icon="🔒"
          title="Password"
          subtitle="Manage your account password"
          onClick={() => open("security")}
        />
      </SettingsGroup>

      <SettingsGroup label="Experience">
        <SettingsRow
          icon="🎨"
          title="Appearance"
          subtitle="Theme, accent and visual preferences"
          onClick={() => open("appearance")}
        />
        <SettingsRow
          icon="🌐"
          title="Language & region"
          subtitle="Language and regional preferences"
          value={LOCALE_LABELS[locale] ?? locale}
          onClick={() => open("region")}
        />
      </SettingsGroup>

      <SettingsGroup label="Communication">
        <SettingsRow
          icon="🔔"
          title="Notifications"
          subtitle="Manage what GEOverze sends you"
          onClick={() => open("notifications")}
        />
      </SettingsGroup>

      <SettingsGroup label="Privacy & security">
        <SettingsRow
          icon="🛡️"
          title="Privacy"
          subtitle="Visibility and data preferences"
          onClick={() => open("privacy")}
        />
        <SettingsRow
          icon="🔐"
          title="Security"
          subtitle="Password and account protection"
          onClick={() => open("security")}
        />
      </SettingsGroup>

      <SettingsGroup label="Account & plan">
        <SettingsRow
          icon="💳"
          title="Subscription"
          subtitle="Manage your GEOverze plan"
          value={SUBSCRIPTION.plan}
          onClick={() => open("billing")}
        />
        <SettingsRow
          icon="🗄️"
          title="Data & account"
          subtitle="Export or manage your account"
          onClick={() => open("data")}
        />
      </SettingsGroup>
    </AnimatedSection>
  );
}
