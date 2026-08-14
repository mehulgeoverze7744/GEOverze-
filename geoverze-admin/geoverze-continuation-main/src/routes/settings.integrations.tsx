import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHeader } from "@/components/shared";
import { Widget } from "@/components/shared/widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsCard, SettingsField } from "@/features/ops/settings-card";
import { notReadyNow } from "@/lib/placeholder";

export const Route = createFileRoute("/settings/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — GEOverze Admin" },
      {
        name: "description",
        content: "Third-party services, API keys and webhook endpoints for GEOverze.",
      },
      { property: "og:title", content: "Integrations — GEOverze Admin" },
      {
        property: "og:description",
        content: "Third-party services, API keys and webhook endpoints for GEOverze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IntegrationSettingsPage,
});

const integrations = [
  { id: "int-pay", name: "Payments", provider: "Stripe", status: "Connected" },
  { id: "int-mail", name: "Transactional email", provider: "Postmark", status: "Connected" },
  { id: "int-analytics", name: "Product analytics", provider: "PostHog", status: "Not connected" },
  { id: "int-storage", name: "Media storage", provider: "Cloudflare R2", status: "Connected" },
  { id: "int-search", name: "Search", provider: "Typesense", status: "Degraded" },
  { id: "int-crm", name: "Support desk", provider: "Zendesk", status: "Not connected" },
];

function IntegrationSettingsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="External services GEOverze depends on, plus API access."
      />
      <PageBody>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => (
            <Widget
              key={integration.id}
              title={integration.name}
              description={integration.provider}
              action={<Badge variant="secondary">{integration.status}</Badge>}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => notReadyNow(`${integration.provider} setup needs the backend.`)}
              >
                {integration.status === "Not connected" ? "Connect" : "Manage"}
              </Button>
            </Widget>
          ))}
        </div>

        <SettingsCard title="API access" description="Server-to-server credentials and callbacks.">
          <SettingsField
            label="Public API key"
            htmlFor="api-key"
            hint="Rotate from the backend once connected."
          >
            <Input id="api-key" readOnly defaultValue="pk_live_••••••••••••••••" />
          </SettingsField>
          <SettingsField label="Webhook endpoint" htmlFor="webhook-url">
            <Input id="webhook-url" placeholder="https://example.com/geoverze/webhook" />
          </SettingsField>
        </SettingsCard>
      </PageBody>
    </>
  );
}
