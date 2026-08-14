import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CalendarClock, CheckCheck, Send } from "lucide-react";
import { toast } from "sonner";

import { PageBody, PageHeader, StatCard, StatGrid } from "@/components/shared";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Widget } from "@/components/shared/widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminNotifications,
  notificationHistory,
  notificationTemplates,
  scheduledNotifications,
} from "@/features/ops/data";
import {
  notificationAudiences,
  notificationChannels,
  notificationTypes,
} from "@/features/ops/types";
import { num } from "@/lib/format";
import { notReadyNow } from "@/lib/placeholder";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Center — GEOverze Admin" },
      {
        name: "description",
        content: "Compose, schedule and audit platform-wide notifications and templates.",
      },
      { property: "og:title", content: "Notification Center — GEOverze Admin" },
      {
        property: "og:description",
        content: "Compose, schedule and audit platform-wide notifications and templates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

const typeTone: Record<string, string> = {
  alert: "text-destructive",
  warning: "text-warning",
  success: "text-success",
  announcement: "text-primary",
};

function NotificationsPage() {
  const [template, setTemplate] = useState("none");

  const stats = useMemo(() => {
    const sent = adminNotifications.filter((item) => item.status === "sent");
    const delivered = sent.reduce((sum, item) => sum + item.recipients, 0);
    const openRate = sent.length
      ? Math.round(sent.reduce((sum, item) => sum + item.openRate, 0) / sent.length)
      : 0;
    return {
      sent: sent.length,
      scheduled: scheduledNotifications.length,
      delivered,
      openRate,
      failed: adminNotifications.filter((item) => item.status === "failed").length,
    };
  }, []);

  const selected = notificationTemplates.find((item) => item.id === template);

  return (
    <>
      <PageHeader
        title="Notification Center"
        description="Everything the platform sends to users, creators and operators."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("All notifications marked as read.")}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            Mark all read
          </Button>
        }
      />

      <PageBody gap="lg">
        <StatGrid columns={5} label="Notification statistics">
          <StatCard label="Sent" value={num(stats.sent)} icon={Send} />
          <StatCard label="Scheduled" value={num(stats.scheduled)} icon={CalendarClock} />
          <StatCard label="Recipients" value={num(stats.delivered)} icon={BellRing} />
          <StatCard label="Avg. open rate" value={`${stats.openRate}%`} delta={2.1} />
          <StatCard label="Failed" value={num(stats.failed)} />
        </StatGrid>

        <Tabs defaultValue="compose">
          <TabsList className="flex-wrap">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="mt-4">
            <form
              className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
              onSubmit={(event) => {
                event.preventDefault();
                toast.success("Notification queued locally — delivery needs the backend.");
              }}
            >
              <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                <SectionHeader
                  title="New broadcast"
                  description="Target an audience, pick a channel and schedule delivery."
                />
                <div className="space-y-1.5">
                  <Label htmlFor="ntf-title">Title</Label>
                  <Input id="ntf-title" placeholder="Scheduled maintenance window" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ntf-body">Message</Label>
                  <Textarea
                    id="ntf-body"
                    rows={5}
                    defaultValue={selected?.body ?? ""}
                    placeholder="What should recipients know?"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ntf-audience">Audience</Label>
                    <Select defaultValue="All users">
                      <SelectTrigger id="ntf-audience">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationAudiences.map((audience) => (
                          <SelectItem key={audience} value={audience}>
                            {audience}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ntf-channel">Channel</Label>
                    <Select defaultValue="In-app">
                      <SelectTrigger id="ntf-channel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationChannels.map((channel) => (
                          <SelectItem key={channel} value={channel}>
                            {channel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ntf-type">Type</Label>
                    <Select defaultValue="announcement">
                      <SelectTrigger id="ntf-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ntf-schedule">Schedule for</Label>
                  <Input id="ntf-schedule" type="datetime-local" className="max-w-64" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" size="sm">
                    Queue notification
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => notReadyNow("Test sends require the messaging service.")}
                  >
                    Send test
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Widget title="Start from template" description="Prefills the message body.">
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger aria-label="Template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Blank message</SelectItem>
                      {notificationTemplates.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selected && (
                    <p className="mt-3 text-xs text-muted-foreground">{selected.subject}</p>
                  )}
                </Widget>
                <Widget title="Delivery preview" description="How the in-app card will look.">
                  <div className="rounded-md border border-border p-3">
                    <p className="text-sm font-medium text-foreground">
                      {selected?.subject ?? "Your title appears here"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selected?.body ?? "Message body preview."}
                    </p>
                  </div>
                </Widget>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              {scheduledNotifications.length === 0 ? (
                <EmptyState
                  title="Nothing scheduled"
                  description="Queue a broadcast to see it here."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {scheduledNotifications.map((item) => (
                    <li key={item.id} className="flex flex-wrap gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.audience} · {item.channel} · by {item.createdBy}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.scheduledFor.replace("T", " ").slice(0, 16)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => notReadyNow("Cancelling needs the scheduler backend.")}
                      >
                        Cancel
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {notificationTemplates.map((item) => (
                <Widget
                  key={item.id}
                  title={item.name}
                  description={`${item.channel} · used ${num(item.usageCount)} times`}
                  action={
                    <Badge variant="secondary" className={cn(typeTone[item.type])}>
                      {item.type}
                    </Badge>
                  }
                >
                  <p className="text-sm font-medium text-foreground">{item.subject}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Updated {item.updatedAt.slice(0, 10)}
                  </p>
                </Widget>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <ul className="divide-y divide-border">
                {notificationHistory.map((item) => (
                  <li key={item.id} className="flex gap-3 px-4 py-3">
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        item.status === "failed" ? "bg-destructive" : "bg-primary",
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{item.body}</p>
                    </div>
                    <span className="shrink-0 text-right text-xs text-muted-foreground">
                      {item.audience} · {item.channel}
                      <br />
                      {item.status === "sent"
                        ? `${num(item.recipients)} sent · ${item.openRate}% opened`
                        : "delivery failed"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
