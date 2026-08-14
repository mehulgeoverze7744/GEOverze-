import { useState } from "react";
import { FileText, Image as ImageIcon, Link2, ScrollText } from "lucide-react";

import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { InspectorField } from "@/components/shared/inspector-panel";
import { SideDrawer } from "@/components/shared/side-drawer";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  moderationActions,
  type ModerationAction,
  type ModerationCase,
} from "@/features/moderation/types";
import { notReadyNow } from "@/lib/placeholder";

const evidenceIcon = {
  screenshot: ImageIcon,
  transcript: FileText,
  link: Link2,
  log: ScrollText,
} as const;

export function CaseDrawer({
  open,
  onOpenChange,
  record,
  onAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ModerationCase | null;
  onAction: (ids: string[], action: ModerationAction, note?: string) => void;
}) {
  const [note, setNote] = useState("");

  if (!record) return null;

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={record.title}
      description={`${record.id} · ${record.surface} report`}
      width="sm:max-w-xl"
      footer={
        <div className="flex flex-wrap gap-2">
          {moderationActions.map((action) => (
            <Button
              key={action}
              size="sm"
              variant={
                action === "Ban" || action === "Suspend"
                  ? "destructive"
                  : action === "Approve"
                    ? "default"
                    : "outline"
              }
              onClick={() => onAction([record.id], action, note)}
            >
              {action}
            </Button>
          ))}
        </div>
      }
    >
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="appeal">Appeal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">{record.summary}</p>
          <dl className="grid grid-cols-2 gap-x-4">
            <InspectorField label="Reason" value={record.reason} />
            <InspectorField label="Reports" value={String(record.reportCount)} />
            <InspectorField label="Priority" value={<SeverityBadge level={record.priority} />} />
            <InspectorField label="Status" value={<StatusBadge status={record.status} />} />
            <InspectorField label="Reporter" value={record.reporter} />
            <InspectorField label="Reported user" value={record.reportedUser} />
            <InspectorField label="Assignee" value={record.assignee} />
            <InspectorField label="Reported" value={record.reportedAt.slice(0, 10)} />
          </dl>
          <div className="space-y-2">
            <Label htmlFor="mod-note">Moderator note</Label>
            <Textarea
              id="mod-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional context recorded on the case timeline…"
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-3 pt-4">
          {record.evidence.map((item) => {
            const Icon = evidenceIcon[item.kind];
            return (
              <article
                key={item.id}
                className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3"
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
              </article>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => notReadyNow("Evidence downloads arrive with the backend.")}
          >
            Download evidence bundle
          </Button>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <ActivityTimeline events={record.timeline} title="Moderation timeline" />
        </TabsContent>

        <TabsContent value="appeal" className="space-y-3 pt-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">
              {record.appealOpen ? "Appeal awaiting review" : "No appeal filed"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Appeal intake, SLA tracking and reviewer assignment connect after backend integration.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!record.appealOpen}
            onClick={() => notReadyNow("Appeal review arrives with the backend.")}
          >
            Review appeal
          </Button>
        </TabsContent>
      </Tabs>
    </SideDrawer>
  );
}
