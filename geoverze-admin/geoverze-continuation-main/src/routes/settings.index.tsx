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
import { fetchPlatformSettings, setPlatformSetting } from "@/features/ops/api";
import { adminKeys } from "@/lib/admin/keys";
import { useAdminQuery } from "@/lib/admin/hooks";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "General Settings — GVRZE Admin" },
      {
        name: "description",
        content: "Platform identity, locale defaults, maintenance mode and feature flags.",
      },
      { property: "og:title", content: "General Settings — GVRZE Admin" },
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

function settingString(
  rows: Array<{ key: string; value: unknown }> | undefined,
  key: string,
  fallback: string,
) {
  const match = rows?.find((row) => row.key === key);
  if (typeof match?.value === "string") return match.value;
  return fallback;
}

function settingBool(
  rows: Array<{ key: string; value: unknown }> | undefined,
  key: string,
  fallback: boolean,
) {
  const match = rows?.find((row) => row.key === key);
  if (typeof match?.value === "boolean") return match.value;
  return fallback;
}

function GeneralSettingsPage() {
  const settings = useAdminQuery(adminKeys.settings, fetchPlatformSettings);
  const rows = settings.data ?? [];
  return (
    <>
      <PageHeader
        title="General"
        description="Core identity and availability settings for the platform."
      />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2">
          <SettingsCard
            title="Platform"
            description="Names and contact details shown to users. Secrets cannot be stored here."
            onSave={async (form) => {
              const data = new FormData(form);
              await setPlatformSetting("platform_name", JSON.parse(JSON.stringify(data.get("platform_name") ?? "GEOverze")));
              await setPlatformSetting("support_email", JSON.parse(JSON.stringify(data.get("support_email") ?? "")));
              await setPlatformSetting("default_locale", JSON.parse(JSON.stringify(data.get("default_locale") ?? "en-US")));
              await setPlatformSetting("timezone", JSON.parse(JSON.stringify(data.get("timezone") ?? "UTC")));
              toast.success("Platform settings saved.");
              void settings.refetch();
            }}
          >
            <SettingsField label="Platform name" htmlFor="platform-name">
              <Input id="platform-name" name="platform_name" defaultValue={settingString(rows, "platform_name", defaultSettings.platformName)} />
            </SettingsField>
            <SettingsField label="Support email" htmlFor="support-email">
              <Input id="support-email" name="support_email" type="email" defaultValue={settingString(rows, "support_email", defaultSettings.supportEmail)} />
            </SettingsField>
            <SettingsField label="Default locale" htmlFor="default-locale">
              <input type="hidden" name="default_locale" value={settingString(rows, "default_locale", defaultSettings.defaultLocale)} />
              <Select
                defaultValue={settingString(rows, "default_locale", defaultSettings.defaultLocale)}
                onValueChange={(value) => {
                  const input = document.querySelector<HTMLInputElement>('input[name="default_locale"]');
                  if (input) input.value = value;
                }}
              >
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
              <input type="hidden" name="timezone" value={settingString(rows, "timezone", defaultSettings.timezone)} />
              <Select
                defaultValue={settingString(rows, "timezone", defaultSettings.timezone)}
                onValueChange={(value) => {
                  const input = document.querySelector<HTMLInputElement>('input[name="timezone"]');
                  if (input) input.value = value;
                }}
              >
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

          <SettingsCard
            title="Availability"
            description="Control access while you ship changes."
            onSave={async (form) => {
              const data = new FormData(form);
              await setPlatformSetting(
                "maintenance_banner",
                JSON.parse(JSON.stringify(data.get("maintenance_banner") ?? "")),
              );
              toast.success("Availability settings saved.");
              void settings.refetch();
            }}
          >
            <SettingsToggle
              label="Maintenance mode"
              description="Show a maintenance screen to everyone except admins."
              defaultChecked={settingBool(rows, "maintenance_mode", defaultSettings.maintenanceMode)}
              onChange={(checked) => {
                void setPlatformSetting("maintenance_mode", checked).then(() => settings.refetch());
              }}
            />
            <SettingsToggle
              label="Open registrations"
              description="Allow new accounts to sign up."
              defaultChecked={settingBool(rows, "signups_open", defaultSettings.signupsOpen)}
              onChange={(checked) => {
                void setPlatformSetting("signups_open", checked).then(() => settings.refetch());
              }}
            />
            <SettingsField label="Maintenance banner" htmlFor="maintenance-note">
              <Textarea
                id="maintenance-note"
                name="maintenance_banner"
                rows={3}
                defaultValue={settingString(rows, "maintenance_banner", "")}
                placeholder="Shown to all users when maintenance mode is enabled."
              />
            </SettingsField>
          </SettingsCard>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Feature flags</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Stored in platform_settings. The public application must read these keys to honor them.
            </p>
          </div>
          <ul className="divide-y divide-border">
            {featureFlags.map((flag) => (
              <li key={flag.id} className="px-4 py-3">
                <SettingsToggle
                  label={flag.name}
                  description={`${flag.description} · ${flag.rollout}`}
                  defaultChecked={settingBool(rows, `flag_${flag.id}`, flag.on)}
                  onChange={(checked) => {
                    void setPlatformSetting(`flag_${flag.id}`, checked).then(() => settings.refetch());
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </PageBody>
    </>
  );
}
