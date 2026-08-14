import { Link } from "@tanstack/react-router";

import { SideDrawer } from "@/components/shared/side-drawer";
import { InspectorField } from "@/components/shared/inspector-panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorAvatar, TierBadge, VerificationBadge } from "@/features/creators/columns";
import { formatDate, formatDateTime, relativeDays } from "@/features/users/format";
import { daysSince } from "@/features/creators/data";
import type { CreatorRecord } from "@/features/creators/types";
import { money, num } from "@/lib/format";

export type CreatorDrawerTab = "overview" | "quizzes" | "verification" | "activity";

export function CreatorDetailDrawer({
  creator,
  open,
  onOpenChange,
  tab,
  onTabChange,
  onVerify,
  onSuspend,
}: {
  creator: CreatorRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: CreatorDrawerTab;
  onTabChange: (tab: CreatorDrawerTab) => void;
  onVerify: (creator: CreatorRecord) => void;
  onSuspend: (creator: CreatorRecord) => void;
}) {
  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={creator ? creator.displayName : "Creator"}
      description={creator ? `@${creator.username} · ${creator.country}` : undefined}
      width="sm:max-w-xl"
      footer={
        creator && (
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/creators/$creatorId" params={{ creatorId: creator.id }}>
                Open full profile
              </Link>
            </Button>
            {creator.verification !== "Verified" && (
              <Button size="sm" variant="outline" onClick={() => onVerify(creator)}>
                Verify
              </Button>
            )}
            {creator.verification !== "Suspended" && (
              <Button size="sm" variant="outline" onClick={() => onSuspend(creator)}>
                Suspend
              </Button>
            )}
          </div>
        )
      }
    >
      {!creator ? (
        <EmptyState title="No creator selected" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CreatorAvatar creator={creator} size={10} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{creator.email}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <TierBadge tier={creator.tier} />
                <VerificationBadge state={creator.verification} />
                <StatusBadge status={creator.status} />
              </div>
            </div>
          </div>

          <Tabs value={tab} onValueChange={(value) => onTabChange(value as CreatorDrawerTab)}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <InspectorField
                label="Creator ID"
                value={<code className="font-mono text-xs">{creator.id}</code>}
              />
              <InspectorField label="Joined" value={formatDate(creator.joinDate)} />
              <InspectorField
                label="Last active"
                value={relativeDays(daysSince(creator.lastActiveAt))}
              />
              <InspectorField label="Followers" value={num(creator.followers)} />
              <InspectorField label="Total plays" value={num(creator.totalPlays)} />
              <InspectorField label="Revenue" value={money(creator.revenue)} />
              <InspectorField label="Average rating" value={creator.rating.toFixed(1)} />
              <InspectorField label="Warnings" value={num(creator.warnings.length)} />
            </TabsContent>

            <TabsContent value="quizzes" className="mt-4 space-y-2">
              {creator.quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {quiz.category} · updated {formatDate(quiz.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs tabular text-muted-foreground">
                      {num(quiz.plays)} plays
                    </span>
                    <StatusBadge status={quiz.status} />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="verification" className="mt-4">
              <ol className="space-y-3">
                {creator.verificationTimeline.map((event) => (
                  <li key={event.id} className="relative pl-4">
                    <span
                      className="absolute top-1.5 left-0 size-1.5 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{event.state}</span> · {event.actor}
                    </p>
                    <p className="text-xs text-muted-foreground">{event.note}</p>
                    <p className="text-xs tabular text-muted-foreground">
                      {formatDateTime(event.at)}
                    </p>
                  </li>
                ))}
              </ol>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <ul className="space-y-3">
                {creator.activity.map((event) => (
                  <li key={event.id} className="text-sm text-foreground">
                    {event.action} <span className="text-muted-foreground">{event.target}</span>
                    <span className="block text-xs tabular text-muted-foreground">
                      {formatDateTime(event.time)}
                    </span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </SideDrawer>
  );
}
