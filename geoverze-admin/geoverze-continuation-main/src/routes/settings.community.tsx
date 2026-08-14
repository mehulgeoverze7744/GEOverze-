import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHeader } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsCard, SettingsField, SettingsToggle } from "@/features/ops/settings-card";
import { defaultSettings } from "@/features/ops/data";

export const Route = createFileRoute("/settings/community")({
  head: () => ({
    meta: [
      { title: "Community Settings — GEOverze Admin" },
      {
        name: "description",
        content: "Moderation automation, report thresholds and community guidelines.",
      },
      { property: "og:title", content: "Community Settings — GEOverze Admin" },
      {
        property: "og:description",
        content: "Moderation automation, report thresholds and community guidelines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunitySettingsPage,
});

function CommunitySettingsPage() {
  return (
    <>
      <PageHeader
        title="Community"
        description="How reports are triaged and what members are allowed to post."
      />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2">
          <SettingsCard title="Moderation" description="Automation applied before human review.">
            <SettingsToggle
              label="Automatic moderation"
              description="Hide content that crosses the report threshold until reviewed."
              defaultChecked={defaultSettings.autoModeration}
            />
            <SettingsToggle
              label="Profanity filter"
              description="Mask flagged language in user-generated content."
              defaultChecked={defaultSettings.profanityFilter}
            />
            <SettingsField
              label="Report threshold"
              htmlFor="report-threshold"
              hint="Reports required before content is auto-hidden."
            >
              <Input
                id="report-threshold"
                type="number"
                className="max-w-40"
                defaultValue={defaultSettings.reportThreshold}
              />
            </SettingsField>
          </SettingsCard>

          <SettingsCard title="Guidelines" description="Shown to members when they report content.">
            <SettingsField label="Community guidelines" htmlFor="guidelines">
              <Textarea
                id="guidelines"
                rows={8}
                defaultValue={
                  "Be accurate. Be respectful. No harassment, hate speech or spam. Cite sources for geography claims."
                }
              />
            </SettingsField>
          </SettingsCard>
        </div>
      </PageBody>
    </>
  );
}
