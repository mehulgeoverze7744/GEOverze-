import { useState } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Ban, Star, Users } from "lucide-react";

import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { StatusBadge } from "@/components/shared/status-badge";
import { InspectorField } from "@/components/shared/inspector-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorAvatar, TierBadge, VerificationBadge } from "@/features/creators/columns";
import { creatorRecords, daysSince, getCreatorById, monthLabels } from "@/features/creators/data";
import { useCreatorActions } from "@/features/creators/use-creator-actions";
import { formatDate, formatDateTime, relativeDays } from "@/features/users/format";
import { money, num } from "@/lib/format";

export const Route = createFileRoute("/creators/$creatorId")({
  loader: ({ params }) => {
    const creator = getCreatorById(params.creatorId);
    if (!creator) throw notFound();
    return { creatorId: creator.id, displayName: creator.displayName };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Creator not found — GEOverze Admin" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.displayName} — Creator Profile | GEOverze Admin`;
    const description = `Verification, quiz ownership, analytics and moderation history for ${loaderData.displayName}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: CreatorNotFound,
  component: CreatorProfilePage,
});

function CreatorNotFound() {
  return (
    <div className="py-10">
      <EmptyState
        title="Creator not found"
        description="This creator ID does not exist in the directory."
        action={
          <Button asChild size="sm" variant="outline" className="mt-2">
            <Link to="/creators">Back to directory</Link>
          </Button>
        }
      />
    </div>
  );
}

function CreatorProfilePage() {
  const { creatorId } = Route.useParams();
  const actions = useCreatorActions(creatorRecords);
  const creator = actions.creators.find((c) => c.id === creatorId);
  const [tab, setTab] = useState("overview");

  if (!creator) return <CreatorNotFound />;

  return (
    <>
      <PageHeader
        title={creator.displayName}
        description={`@${creator.username} · ${creator.email} · ${creator.country}`}
        actions={
          <>
            <Button asChild size="sm" variant="ghost">
              <Link to="/creators">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Directory
              </Link>
            </Button>
            {creator.verification !== "Verified" ? (
              <Button size="sm" onClick={() => actions.requestVerify(creator)}>
                <BadgeCheck className="size-4" aria-hidden="true" />
                Verify
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={actions.placeholder("Tier changes require backend integration.")}
              >
                Change tier
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => actions.requestSuspend(creator)}>
              <Ban className="size-4" aria-hidden="true" />
              Suspend
            </Button>
          </>
        }
      />

      <PageBody>
        <section className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
          <CreatorAvatar creator={creator} size={10} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{creator.bio}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <TierBadge tier={creator.tier} />
              <VerificationBadge state={creator.verification} />
              <StatusBadge status={creator.status} />
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {creator.activityState}
              </span>
            </div>
          </div>
        </section>

        <StatGrid label="Creator performance">
          <StatCard label="Followers" value={num(creator.followers)} icon={Users} />
          <StatCard label="Total plays" value={num(creator.totalPlays)} />
          <StatCard label="Lifetime revenue" value={money(creator.revenue)} />
          <StatCard label="Average rating" value={creator.rating.toFixed(1)} icon={Star} />
        </StatGrid>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 grid gap-3 lg:grid-cols-2">
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">Profile</h2>
              <div className="mt-2">
                <InspectorField
                  label="Creator ID"
                  value={<code className="font-mono text-xs">{creator.id}</code>}
                />
                <InspectorField label="Joined" value={formatDate(creator.joinDate)} />
                <InspectorField
                  label="Last active"
                  value={relativeDays(daysSince(creator.lastActiveAt))}
                />
                <InspectorField label="Website" value={creator.website} />
                <InspectorField label="Quizzes" value={num(creator.totalQuizzes)} />
                <InspectorField label="Published" value={num(creator.publishedQuizzes)} />
                <InspectorField label="Drafts" value={num(creator.draftQuizzes)} />
              </div>
            </section>
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">Achievements</h2>
              {creator.achievements.length === 0 ? (
                <EmptyState title="No achievements yet" />
              ) : (
                <ul className="mt-3 space-y-2">
                  {creator.achievements.map((achievement) => (
                    <li
                      key={achievement.id}
                      className="rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-foreground">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description} · {formatDate(achievement.earnedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </TabsContent>

          <TabsContent value="quizzes" className="mt-4 space-y-2">
            {creator.quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{quiz.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {quiz.category} · updated {formatDate(quiz.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs tabular text-muted-foreground">
                  <span>{num(quiz.plays)} plays</span>
                  <span>{quiz.averageScore}% avg score</span>
                  <span>{quiz.completionRate}% completion</span>
                  <span>{quiz.rating.toFixed(1)} rating</span>
                  <StatusBadge status={quiz.status} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 grid gap-3 lg:grid-cols-2">
            <ChartCard
              title="Revenue by month"
              description="Creator earnings over the last 12 months"
              series={creator.revenueSeries.map((point) => {
                const max = Math.max(...creator.revenueSeries.map((p) => p.amount), 1);
                return Math.round((point.amount / max) * 100);
              })}
              labels={monthLabels}
              footnote={`Total ${money(creator.revenue)} lifetime — placeholder visualization.`}
            />
            <ChartCard
              title="Quiz plays"
              description="Monthly play volume across owned quizzes"
              series={creator.playsSeries}
              labels={monthLabels}
            />
          </TabsContent>

          <TabsContent value="verification" className="mt-4">
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">Verification timeline</h2>
              <ol className="mt-4 space-y-4">
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
              {creator.verification === "Pending" && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => actions.requestVerify(creator)}>
                    Approve application
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => actions.requestReject(creator)}
                  >
                    Reject application
                  </Button>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="moderation" className="mt-4 grid gap-3 lg:grid-cols-2">
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">Warnings</h2>
              {creator.warnings.length === 0 ? (
                <EmptyState title="No warnings on record" />
              ) : (
                <ul className="mt-3 space-y-2">
                  {creator.warnings.map((warning) => (
                    <li key={warning.id} className="rounded-md border border-border px-3 py-2">
                      <p className="text-sm text-foreground">{warning.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {warning.severity} · {warning.issuedBy} · {formatDate(warning.issuedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">Internal notes</h2>
              {creator.notes.length === 0 ? (
                <EmptyState title="No internal notes yet" />
              ) : (
                <ul className="mt-3 space-y-2">
                  {creator.notes.map((note) => (
                    <li key={note.id} className="rounded-md border border-border px-3 py-2">
                      <p className="text-sm text-foreground">{note.body}</p>
                      <p className="text-xs text-muted-foreground">
                        {note.author} · {formatDate(note.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={actions.placeholder("Notes are saved once the backend is connected.")}
              >
                Add note
              </Button>
            </section>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
              <ol className="mt-4 space-y-3">
                {creator.activity.map((event) => (
                  <li key={event.id} className="relative pl-4">
                    <span
                      className="absolute top-1.5 left-0 size-1.5 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{event.actor}</span> {event.action}{" "}
                      <span className="text-muted-foreground">{event.target}</span>
                    </p>
                    <p className="text-xs tabular text-muted-foreground">
                      {formatDateTime(event.time)}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          </TabsContent>
        </Tabs>
      </PageBody>

      {actions.confirm && (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && actions.setConfirm(null)}
          title={actions.confirm.title}
          description={actions.confirm.description}
          confirmLabel={actions.confirm.confirmLabel}
          destructive={actions.confirm.destructive}
          onConfirm={() => {
            actions.confirm?.onConfirm();
            actions.setConfirm(null);
          }}
        />
      )}
    </>
  );
}
