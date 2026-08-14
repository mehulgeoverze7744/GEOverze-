import { useState, type ReactNode } from "react";
import {
  Award,
  Bookmark,
  Flag,
  History,
  Play,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { SideDrawer } from "@/components/shared/side-drawer";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MembershipBadge, UserAvatar } from "@/features/users/columns";
import { daysSince } from "@/features/users/data";
import { formatDate, formatDateTime, relativeDays } from "@/features/users/format";
import type { PlatformUser } from "@/features/users/types";
import { money, num } from "@/lib/format";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-xs tracking-wide text-muted-foreground uppercase">{label}</span>
      <span className="min-w-0 text-right text-sm text-foreground">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}

export type UserDrawerTab =
  | "overview"
  | "achievements"
  | "activity"
  | "purchases"
  | "reports"
  | "bookmarks"
  | "creator"
  | "logins";

export interface UserDetailDrawerProps {
  user: PlatformUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: UserDrawerTab | undefined;
}

export function UserDetailDrawer({
  user,
  open,
  onOpenChange,
  defaultTab = "overview",
}: UserDetailDrawerProps) {
  const [tab, setTab] = useState<string>(defaultTab);

  if (!user) return null;

  const xpToNext = 5000;
  const xpProgress = Math.round(((user.xp % xpToNext) / xpToNext) * 100);

  return (
    <SideDrawer
      open={open}
      onOpenChange={(next) => {
        if (next) setTab(defaultTab);
        onOpenChange(next);
      }}
      title={user.displayName}
      description={`@${user.username} · ${user.email}`}
      width="sm:max-w-xl"
      flush
      footer={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.info("Edit user requires backend integration.")}
          >
            Edit user
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.info("Password reset is a placeholder.")}
          >
            Reset password
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.info("Grant membership is a placeholder.")}
          >
            Grant membership
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.info("Adjust credits is a placeholder.")}
          >
            Adjust credits
          </Button>
        </div>
      }
    >
      <div className="flex items-center gap-3 border-b border-border p-4">
        <UserAvatar user={user} size={10} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{user.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <MembershipBadge membership={user.membership} />
          <StatusBadge status={user.status} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="overflow-x-auto border-b border-border px-2">
          <TabsList className="h-9 justify-start bg-transparent p-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Quiz activity</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            {user.creator && <TabsTrigger value="creator">Creator</TabsTrigger>}
            <TabsTrigger value="logins">Logins</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-5 p-4">
          <Section title="Basic information">
            <Field
              label="User ID"
              value={<code className="font-mono text-xs break-all">{user.id}</code>}
            />
            <Field label="Email" value={user.email} />
            <Field label="Role" value={user.role} />
            <Field label="Country" value={user.country} />
            <Field label="Age verification" value={user.ageVerified ? "Verified" : "Unverified"} />
            <Field label="Registered" value={formatDate(user.registeredAt)} />
            <Field
              label="Last active"
              value={`${relativeDays(daysSince(user.lastActiveAt))} · ${formatDate(user.lastActiveAt)}`}
            />
          </Section>

          <Section title="Membership">
            <Field label="Plan" value={<MembershipBadge membership={user.membership} />} />
            <Field label="Creator status" value={user.creatorStatus} />
            <Field label="Current streak" value={`${user.currentStreak} days`} />
          </Section>

          <Section title="Credits & XP">
            <Field label="Credits" value={num(user.credits)} />
            <Field label="Level" value={user.level} />
            <Field label="Total XP" value={num(user.xp)} />
            <div className="pt-3">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Progress to level {user.level + 1}</span>
                <span className="tabular">{xpProgress}%</span>
              </div>
              <Progress value={xpProgress} className="h-1.5" />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="achievements" className="p-4">
          {user.achievements.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No achievements yet"
              description="This player has not unlocked any badges."
            />
          ) : (
            <ul className="space-y-2">
              {user.achievements.map((achievement) => (
                <li key={achievement.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{achievement.name}</p>
                    <span className="text-xs text-muted-foreground">{achievement.rarity}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{achievement.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Earned {formatDate(achievement.earnedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="activity" className="p-4">
          {user.quizActivity.length === 0 ? (
            <EmptyState
              icon={Play}
              title="No recent quiz activity"
              description="No plays recorded in the last 30 days."
            />
          ) : (
            <ul className="divide-y divide-border">
              {user.quizActivity.map((attempt) => (
                <li key={attempt.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{attempt.quiz}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(attempt.playedAt)}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs tabular text-muted-foreground">
                    <p className="text-sm text-foreground">{attempt.score} pts</p>
                    <p>{attempt.accuracy}% accuracy</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="purchases" className="p-4">
          {user.purchases.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No purchases"
              description="This account has never bought from the store."
            />
          ) : (
            <ul className="divide-y divide-border">
              {user.purchases.map((purchase) => (
                <li key={purchase.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{purchase.item}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(purchase.purchasedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm tabular text-foreground">
                      {money(purchase.amount, purchase.currency)}
                    </span>
                    <StatusBadge status={purchase.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="reports" className="p-4">
          {user.reports.length === 0 ? (
            <EmptyState
              icon={Flag}
              title="No reports"
              description="No moderation reports involve this user."
            />
          ) : (
            <ul className="divide-y divide-border">
              {user.reports.map((report) => (
                <li key={report.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{report.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.direction} · {formatDate(report.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={report.status} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="p-4">
          {user.bookmarks.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No bookmarks"
              description="Nothing saved to this user's library."
            />
          ) : (
            <ul className="divide-y divide-border">
              {user.bookmarks.map((bookmark) => (
                <li key={bookmark.id} className="flex items-center justify-between gap-3 py-2.5">
                  <p className="min-w-0 truncate text-sm text-foreground">{bookmark.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {bookmark.type} · {formatDate(bookmark.savedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {user.creator && (
          <TabsContent value="creator" className="p-4">
            <Section title="Creator information">
              <Field label="Handle" value={user.creator.handle} />
              <Field label="Tier" value={user.creator.tier} />
              <Field label="Published quizzes" value={num(user.creator.publishedQuizzes)} />
              <Field label="Followers" value={num(user.creator.followers)} />
              <Field label="Lifetime revenue" value={money(user.creator.lifetimeRevenue)} />
              <Field label="Applied" value={formatDate(user.creator.appliedAt)} />
            </Section>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Payout details load once the backend is connected.
            </p>
          </TabsContent>
        )}

        <TabsContent value="logins" className="p-4">
          <ul className="divide-y divide-border">
            {user.loginHistory.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{event.device}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.location} · {event.ip}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={
                      event.result === "Success"
                        ? "text-xs text-success"
                        : "text-xs text-destructive"
                    }
                  >
                    {event.result}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(event.at)}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <History className="size-3.5" aria-hidden="true" />
            Placeholder session data — full audit trail arrives with the backend.
          </p>
        </TabsContent>
      </Tabs>

      <p className="flex items-center gap-1.5 px-4 pb-4 text-xs text-muted-foreground">
        <UserRound className="size-3.5" aria-hidden="true" />
        Read-only preview. No changes are persisted.
      </p>
    </SideDrawer>
  );
}
