import { Link, createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Archive, Star, Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollectionEditor } from "@/features/library/collections/components/CollectionEditor";
import { useLibraryCollectionDetail } from "@/features/library/collections/hooks/useLibraryCollectionDetail";
import { useLibraryCollectionMutations } from "@/features/library/collections/hooks/useLibraryCollectionMutations";

export const Route = createFileRoute("/library/collections/$collectionId")({
  component: CollectionDetailPage,
});

function CollectionDetailPage() {
  const { collectionId } = useParams({ from: "/library/collections/$collectionId" });
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { collection, loading, error } = useLibraryCollectionDetail(collectionId);
  const mutations = useLibraryCollectionMutations();

  if (loading) {
    return (
      <PageBody>
        <p className="text-sm text-muted-foreground">Loading collection…</p>
      </PageBody>
    );
  }

  if (error || !collection) {
    return (
      <PageBody>
        <EmptyState
          title="Collection not found"
          description={error ?? "This collection is no longer available."}
        />
      </PageBody>
    );
  }

  return (
    <>
      <PageHeader
        title={collection.title}
        description={`/${collection.slug} · ${collection.memberResourceIds.length} entries`}
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link to="/library/collections">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => mutations.publish.mutate(collection.id)}
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                mutations.feature.mutate({ id: collection.id, featured: !collection.featured })
              }
            >
              <Star className="size-4" aria-hidden="true" />
              {collection.featured ? "Unfeature" : "Feature"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => mutations.archive.mutate(collection.id)}
            >
              <Archive className="size-4" aria-hidden="true" />
              Archive
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </>
        }
      />

      <PageBody>
        <div className="mb-4 flex items-center gap-2">
          <StatusBadge status={collection.status} />
          <span className="text-xs text-muted-foreground">Curator: {collection.curatorHandle}</span>
        </div>

        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-4">
            <CollectionEditor
              collection={collection}
              onSave={(next) => mutations.update.mutate(next)}
            />
          </TabsContent>
          <TabsContent value="overview" className="mt-4">
            <CollectionEditor collection={collection} onSave={() => undefined} readOnly />
          </TabsContent>
        </Tabs>
      </PageBody>

      {confirmDelete ? (
        <ConfirmDialog
          open
          onOpenChange={setConfirmDelete}
          title="Delete this collection?"
          description="Membership rows are removed. GEOlibrary resources are not deleted."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            mutations.remove.mutate(collection.id, {
              onSuccess: () => navigate({ to: "/library/collections" }),
            });
          }}
        />
      ) : null}
    </>
  );
}
