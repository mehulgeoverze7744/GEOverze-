import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHeader } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsCard, SettingsField, SettingsToggle } from "@/features/ops/settings-card";
import { defaultSettings, featureFlags } from "@/features/ops/data";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "General Settings — GEOverze Admin" },
      {
        name: "description",
        content: "Platform identity, locale defaults, maintenance mode and feature flags.",
      },
      { property: "og:title", content: "General Settings — GEOverze Admin" },
      {
        property: "og:description",
        content: "Platform identity, locale defaults, maintenance mode and feature flags.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GeneralSettingsPage,
});

function GeneralSettingsPage() {
  return (
    <>
      <PageHeader
        title="General"
        description="Core identity and availability settings for the platform."
      />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2">
          <SettingsCard title="Platform" description="Names and contact details shown to users.">
            <SettingsField label="Platform name" htmlFor="platform-name">
              <Input id="platform-name" defaultValue={defaultSettings.platformName} />
            </SettingsField>
            <SettingsField label="Support email" htmlFor="support-email">
              <Input id="support-email" type="email" defaultValue={defaultSettings.supportEmail} />
            </SettingsField>
            <SettingsField label="Default locale" htmlFor="default-locale">
              <Select defaultValue={defaultSettings.defaultLocale}>
                <SelectTrigger id="default-locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["en-US", "en-GB", "de-DE", "pt-BR", "hi-IN", "ja-JP"].map((locale) => (
                    <SelectItem key={locale} value={locale}>
                      {locale}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsField>
            <SettingsField label="Timezone" htmlFor="timezone">
              <Select defaultValue={defaultSettings.timezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["UTC", "Europe/Lisbon", "Europe/Berlin", "America/New_York", "Asia/Tokyo"].map(
                    (zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </SettingsField>
          </SettingsCard>

          <SettingsCard title="Availability" description="Control access while you ship changes.">
            <SettingsToggle
              label="Maintenance mode"
              description="Show a maintenance screen to everyone except admins."
              defaultChecked={defaultSettings.maintenanceMode}
            />
            <SettingsToggle
              label="Open registrations"
              description="Allow new accounts to sign up."
              defaultChecked={defaultSettings.signupsOpen}
            />
            <SettingsField label="Maintenance banner" htmlFor="maintenance-note">
              <Textarea
                id="maintenance-note"
                rows={3}
                placeholder="Shown to all users when maintenance mode is enabled."
              />
            </SettingsField>
          </SettingsCard>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Feature flags</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Progressive rollout switches — local only until the backend is connected.
            </p>
          </div>
          <ul className="divide-y divide-border">
            {featureFlags.map((flag) => (
              <li key={flag.id} className="px-4 py-3">
                <SettingsToggle
                  label={flag.name}
                  description={`${flag.description} · ${flag.rollout}`}
                  defaultChecked={flag.on}
                />
              </li>
            ))}
          </ul>
        </div>
      </PageBody>
    </>
  );
}
