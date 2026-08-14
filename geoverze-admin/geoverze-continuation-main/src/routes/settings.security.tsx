import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHeader } from "@/components/shared";
import { Widget } from "@/components/shared/widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsCard, SettingsField, SettingsToggle } from "@/features/ops/settings-card";
import { activeSessions, defaultSettings } from "@/features/ops/data";
import { notReadyNow } from "@/lib/placeholder";

export const Route = createFileRoute("/settings/security")({
  head: () => ({
    meta: [
      { title: "Security Settings — GEOverze Admin" },
      {
        name: "description",
        content: "Admin authentication policy, session lifetime and console access controls.",
      },
      { property: "og:title", content: "Security Settings — GEOverze Admin" },
      {
        property: "og:description",
        content: "Admin authentication policy, session lifetime and console access controls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SecuritySettingsPage,
});

function SecuritySettingsPage() {
  return (
    <>
      <PageHeader title="Security" description="Who can reach the console, and for how long." />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2">
          <SettingsCard title="Access policy" description="Applied to every admin role.">
            <SettingsToggle
              label="Require MFA for admins"
              description="Enforced at sign-in for every admin role."
              defaultChecked={defaultSettings.requireMfa}
            />
            <SettingsToggle
              label="IP allowlist"
              description="Restrict console access to approved ranges."
              defaultChecked={defaultSettings.ipAllowlist}
            />
            <SettingsField label="Allowed ranges" htmlFor="ip-ranges" hint="One CIDR per line.">
              <Textarea id="ip-ranges" rows={4} placeholder="203.0.113.0/24" />
            </SettingsField>
            <SettingsField label="Session length (minutes)" htmlFor="session-length">
              <Input
                id="session-length"
                type="number"
                className="max-w-40"
                defaultValue={defaultSettings.sessionMinutes}
              />
            </SettingsField>
          </SettingsCard>

          <Widget
            title="Active sessions"
            description="Operators currently signed into the console."
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => notReadyNow("Bulk revoke requires the auth backend.")}
              >
                Revoke all
              </Button>
            }
          >
            <ul className="divide-y divide-border">
              {activeSessions.slice(0, 8).map((session) => (
                <li key={session.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{session.admin}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.device} · {session.location}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular text-muted-foreground">
                    {session.ip}
                  </span>
                </li>
              ))}
            </ul>
          </Widget>
        </div>
      </PageBody>
    </>
  );
}
