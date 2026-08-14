import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHeader } from "@/components/shared";
import { Widget } from "@/components/shared/widget";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsCard, SettingsField } from "@/features/ops/settings-card";
import { defaultSettings } from "@/features/ops/data";

export const Route = createFileRoute("/settings/branding")({
  head: () => ({
    meta: [
      { title: "Branding Settings — GEOverze Admin" },
      {
        name: "description",
        content: "Logo, colours and the public-facing voice of the GEOverze platform.",
      },
      { property: "og:title", content: "Branding Settings — GEOverze Admin" },
      {
        property: "og:description",
        content: "Logo, colours and the public-facing voice of the GEOverze platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BrandingSettingsPage,
});

function BrandingSettingsPage() {
  return (
    <>
      <PageHeader title="Branding" description="How GEOverze presents itself across surfaces." />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2">
          <SettingsCard title="Identity" description="Marks and copy used in product and email.">
            <SettingsField label="Logo URL" htmlFor="logo-url">
              <Input id="logo-url" defaultValue={defaultSettings.logoUrl} />
            </SettingsField>
            <SettingsField
              label="Primary colour"
              htmlFor="primary-color"
              hint="Applied to accents and calls to action."
            >
              <Input id="primary-color" defaultValue={defaultSettings.primaryColor} />
            </SettingsField>
            <SettingsField label="Tagline" htmlFor="tagline">
              <Textarea id="tagline" rows={2} defaultValue={defaultSettings.tagline} />
            </SettingsField>
          </SettingsCard>

          <Widget title="Preview" description="Approximation of the branded header.">
            <div className="rounded-md border border-border p-4">
              <p className="text-lg font-semibold tracking-tight text-foreground">
                {defaultSettings.platformName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{defaultSettings.tagline}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="size-6 rounded-md bg-primary" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">
                  {defaultSettings.primaryColor}
                </span>
              </div>
            </div>
          </Widget>
        </div>
      </PageBody>
    </>
  );
}
