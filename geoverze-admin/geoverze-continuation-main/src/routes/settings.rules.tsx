import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHeader } from "@/components/shared";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsCard, SettingsField, SettingsToggle } from "@/features/ops/settings-card";
import { defaultSettings } from "@/features/ops/data";

export const Route = createFileRoute("/settings/rules")({
  head: () => ({
    meta: [
      { title: "Platform Rules — GEOverze Admin" },
      {
        name: "description",
        content: "Quiz limits, reward approvals, credit caps and subscription defaults.",
      },
      { property: "og:title", content: "Platform Rules — GEOverze Admin" },
      {
        property: "og:description",
        content: "Quiz limits, reward approvals, credit caps and subscription defaults.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RuleSettingsPage,
});

function RuleSettingsPage() {
  return (
    <>
      <PageHeader
        title="Platform rules"
        description="Operational defaults for quizzes, rewards, credits and plans."
      />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2">
          <SettingsCard title="Quiz rules" description="Limits applied to every published quiz.">
            <SettingsField label="Maximum questions" htmlFor="quiz-max">
              <Input
                id="quiz-max"
                type="number"
                className="max-w-40"
                defaultValue={defaultSettings.quizMaxQuestions}
              />
            </SettingsField>
            <SettingsField label="Default time limit (seconds per question)" htmlFor="quiz-time">
              <Input
                id="quiz-time"
                type="number"
                className="max-w-40"
                defaultValue={defaultSettings.quizTimeLimit}
              />
            </SettingsField>
            <SettingsToggle
              label="Auto-publish verified creators"
              description="Skip review for quizzes authored by verified creators."
              defaultChecked={defaultSettings.quizAutoPublish}
            />
          </SettingsCard>

          <SettingsCard title="Reward rules" description="Guardrails for the rewards catalogue.">
            <SettingsToggle
              label="Require approval for claims"
              description="Every redemption is reviewed before fulfilment."
              defaultChecked={defaultSettings.rewardApprovalRequired}
            />
            <SettingsField label="Monthly claims per user" htmlFor="reward-cap">
              <Input
                id="reward-cap"
                type="number"
                className="max-w-40"
                defaultValue={defaultSettings.rewardMonthlyCap}
              />
            </SettingsField>
          </SettingsCard>

          <SettingsCard
            title="Credit rules"
            description="Caps and expiry for the GEOcredit economy."
          >
            <SettingsField label="Daily earning cap" htmlFor="credit-cap">
              <Input
                id="credit-cap"
                type="number"
                className="max-w-40"
                defaultValue={defaultSettings.creditDailyCap}
              />
            </SettingsField>
            <SettingsField label="Credit expiry (days)" htmlFor="credit-expiry">
              <Input
                id="credit-expiry"
                type="number"
                className="max-w-40"
                defaultValue={defaultSettings.creditExpiryDays}
              />
            </SettingsField>
            <SettingsField label="Reset cadence" htmlFor="credit-reset">
              <Select defaultValue={defaultSettings.creditResetCadence}>
                <SelectTrigger id="credit-reset" className="max-w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Never", "Monthly", "Quarterly", "Annually"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsField>
          </SettingsCard>

          <SettingsCard
            title="Subscription rules"
            description="Trials, grace periods and upgrades."
          >
            <SettingsField label="Trial length (days)" htmlFor="trial-days">
              <Input
                id="trial-days"
                type="number"
                className="max-w-40"
                defaultValue={defaultSettings.trialDays}
              />
            </SettingsField>
            <SettingsField label="Payment grace period (days)" htmlFor="grace-days">
              <Input
                id="grace-days"
                type="number"
                className="max-w-40"
                defaultValue={defaultSettings.gracePeriodDays}
              />
            </SettingsField>
            <SettingsToggle
              label="Prorate upgrades"
              description="Charge the difference immediately when a plan changes."
              defaultChecked={defaultSettings.proratedUpgrades}
            />
          </SettingsCard>
        </div>
      </PageBody>
    </>
  );
}
