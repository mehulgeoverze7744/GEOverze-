import { Link, createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorPersonaEditor } from "@/features/library/creator-personas/components/CreatorPersonaEditor";
import { useLibraryCreatorMutations } from "@/features/library/creator-personas/hooks/useLibraryCreatorMutations";
import { useLibraryCreatorPersonaDetail } from "@/features/library/creator-personas/hooks/useLibraryCreatorPersonaDetail";

export const Route = createFileRoute("/library/creators/$handle")({
  component: LibraryCreatorDetailPage,
});

function LibraryCreatorDetailPage() {
  const { handle } = useParams({ from: "/library/creators/$handle" });
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { persona, loading, error } = useLibraryCreatorPersonaDetail(handle);
  const mutations = useLibraryCreatorMutations();

  if (loading) {
    return (
      <PageBody>
        <p className="text-sm text-muted-foreground">Loading creator…</p>
      </PageBody>
    );
  }

  if (error || !persona) {
    return (
      <PageBody>
        <EmptyState
          title="Creator not found"
          description={error ?? "This persona is no longer available."}
        />
      </PageBody>
    );
  }

  return (
    <>
      <PageHeader
        title={persona.displayName}
        description={`@${persona.handle} · ${persona.role}`}
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link to="/library/creators">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back
              </Link>
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </>
        }
      />

      <PageBody>
        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-4">
            <CreatorPersonaEditor
              persona={persona}
              onSave={(next) => mutations.update.mutate(next)}
            />
          </TabsContent>
          <TabsContent value="overview" className="mt-4">
            <CreatorPersonaEditor persona={persona} onSave={() => undefined} readOnly />
          </TabsContent>
        </Tabs>
      </PageBody>

      {confirmDelete ? (
        <ConfirmDialog
          open
          onOpenChange={setConfirmDelete}
          title="Delete this creator?"
          description="Resources authored by this handle are not deleted."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            mutations.remove.mutate(persona.handle, {
              onSuccess: () => navigate({ to: "/library/creators" }),
            });
          }}
        />
      ) : null}
    </>
  );
}
