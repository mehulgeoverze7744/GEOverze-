import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Archive, Star, Trash2 } from "lucide-react";

import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { InspectorField } from "@/components/shared/inspector-panel";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { StatusBadge } from "@/components/shared/status-badge";
import { Widget } from "@/components/shared/widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findResource, libraryResources } from "@/features/library/data";
import { ResourceEditor } from "@/features/library/resource-editor";
import { useLibraryActions } from "@/features/library/use-library-actions";
import { formatDate } from "@/features/users/format";
import { catalogMonths } from "@/lib/catalog";
import { num } from "@/lib/format";

export const Route = createFileRoute("/library/$resourceId")({
  head: () => ({
    meta: [
      { title: "Library Resource — GEOverze Admin" },
      {
        name: "description",
        content: "Resource overview, content, media, SEO, analytics and version history.",
      },
      { property: "og:title", content: "Library Resource — GEOverze Admin" },
      {
        property: "og:description",
        content: "Full editorial record for a GEOlibrary resource.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResourceDetailPage,
});

function ResourceDetailPage() {
  const { resourceId } = useParams({ from: "/library/$resourceId" });
  const navigate = useNavigate();
  const actions = useLibraryActions(libraryResources);
  const [tab, setTab] = useState("overview");

  const resource = useMemo(
    () => findResource(actions.resources, resourceId),
    [actions.resources, resourceId],
  );

  if (!resource) {
    return (
      <>
        <PageHeader title="Resource not found" />
        <PageBody>
          <EmptyState
            title="This resource no longer exists"
            description="It may have been deleted or the link is out of date."
            action={
              <Button size="sm" asChild>
                <Link to="/library">Back to GEOlibrary</Link>
              </Button>
            }
          />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={resource.title}
        description={resource.description}
        actions={
          <>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/library">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => actions.toggleFeatured(resource.id)}>
              <Star className="size-4" aria-hidden="true" />
              {resource.featured ? "Unfeature" : "Feature"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => actions.requestArchive([resource.id])}
            >
              <Archive className="size-4" aria-hidden="true" />
              Archive
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => actions.requestDelete([resource.id])}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
            {resource.status === "published" ? (
              <Button size="sm" onClick={() => actions.unpublish([resource.id])}>
                Unpublish
              </Button>
            ) : (
              <Button size="sm" onClick={() => actions.publish([resource.id])}>
                Publish
              </Button>
            )}
          </>
        }
      />

      <PageBody>
        <StatGrid columns={4} label="Resource performance">
          <StatCard label="Views" value={num(resource.views)} />
          <StatCard label="Bookmarks" value={num(resource.bookmarks)} />
          <StatCard label="Read time" value={`${resource.readTime} min`} />
          <StatCard label="Versions" value={num(resource.versions.length)} />
        </StatGrid>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <Widget title="Resource details">
                <div>
                  <InspectorField
                    label="Resource ID"
                    value={<code className="font-mono text-xs">{resource.id}</code>}
                  />
                  <InspectorField label="Slug" value={`/${resource.slug}`} />
                  <InspectorField label="Category" value={resource.category} />
                  <InspectorField label="Country" value={resource.country} />
                  <InspectorField label="Region" value={resource.region} />
                  <InspectorField
                    label="Difficulty"
                    value={<DifficultyBadge level={resource.difficulty} />}
                  />
                  <InspectorField label="Language" value={resource.language} />
                  <InspectorField label="Author" value={resource.author} />
                  <InspectorField label="Status" value={<StatusBadge status={resource.status} />} />
                  <InspectorField label="Featured" value={resource.featured ? "Yes" : "No"} />
                  <InspectorField label="Created" value={formatDate(resource.createdAt)} />
                  <InspectorField label="Updated" value={formatDate(resource.updatedAt)} />
                </div>
              </Widget>
              <Widget title="Tags" description="Discovery and classroom filters">
                <div className="flex flex-wrap gap-1.5">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {resource.tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">No tags yet.</p>
                  )}
                </div>
              </Widget>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <article className="rounded-lg border border-border bg-card p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                {resource.body}
              </pre>
            </article>
          </TabsContent>

          <TabsContent value="media" className="mt-4 space-y-3">
            <Widget title="Cover">
              <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-border-strong bg-muted/30 text-sm text-muted-foreground">
                {resource.coverLabel}
              </div>
            </Widget>
            <Widget title="Gallery">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {resource.gallery.map((figure) => (
                  <div
                    key={figure}
                    className="flex h-20 items-center justify-center rounded-md border border-border bg-muted/30 px-2 text-center text-[11px] text-muted-foreground"
                  >
                    {figure}
                  </div>
                ))}
              </div>
            </Widget>
            <Widget title="Attachments">
              <ul className="divide-y divide-border">
                {resource.attachments.length === 0 && (
                  <li className="py-2 text-sm text-muted-foreground">No attachments.</li>
                )}
                {resource.attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center gap-2 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
                    <Badge variant="secondary">{attachment.kind}</Badge>
                    <span className="text-xs text-muted-foreground tabular">{attachment.size}</span>
                  </li>
                ))}
              </ul>
            </Widget>
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <Widget title="Search metadata">
              <div>
                <InspectorField label="Meta title" value={resource.seo.metaTitle} />
                <InspectorField label="Meta description" value={resource.seo.metaDescription} />
                <InspectorField label="Canonical URL" value={resource.seo.canonicalUrl} />
                <InspectorField label="OG title" value={resource.seo.ogTitle} />
                <InspectorField label="OG description" value={resource.seo.ogDescription} />
                <InspectorField label="Keywords" value={resource.seo.keywords.join(", ")} />
              </div>
            </Widget>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <ChartCard
              title="Views over time"
              description="Rolling 12 months"
              series={resource.viewsSeries}
              labels={catalogMonths}
            />
          </TabsContent>

          <TabsContent value="edit" className="mt-4">
            <ResourceEditor
              resource={resource}
              onSave={(next) => {
                actions.save(next);
                setTab("overview");
              }}
              onCancel={() => setTab("overview")}
            />
          </TabsContent>

          <TabsContent value="versions" className="mt-4">
            <ol className="divide-y divide-border rounded-lg border border-border">
              {resource.versions.map((version) => (
                <li key={version.id} className="flex flex-wrap items-center gap-2 p-3 text-sm">
                  <Badge variant="secondary">v{version.version}</Badge>
                  <span className="min-w-0 flex-1 truncate">{version.summary}</span>
                  <span className="text-xs text-muted-foreground">{version.author}</span>
                  <span className="text-xs text-muted-foreground tabular">
                    {formatDate(version.at)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={actions.placeholder("Version restore arrives with the backend.")}
                  >
                    Restore
                  </Button>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <ActivityTimeline
              events={resource.activity.map((event) => ({
                id: event.id,
                actor: event.actor,
                action: event.action,
                target: event.target,
                time: formatDate(event.time),
              }))}
            />
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
            const wasDelete = actions.confirm?.destructive;
            actions.confirm?.onConfirm();
            actions.setConfirm(null);
            if (wasDelete) navigate({ to: "/library" });
          }}
        />
      )}
    </>
  );
}
