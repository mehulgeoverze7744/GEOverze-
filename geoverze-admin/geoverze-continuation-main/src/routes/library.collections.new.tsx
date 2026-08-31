import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { CollectionEditor } from "@/features/library/collections/components/CollectionEditor";
import { createDraftCollection } from "@/features/library/collections/data/collection-mutations";
import { useLibraryCollectionMutations } from "@/features/library/collections/hooks/useLibraryCollectionMutations";
import { fetchLibraryCreators } from "@/features/library/data/fetchLibraryResources";

export const Route = createFileRoute("/library/collections/new")({
  component: NewCollectionPage,
});

function NewCollectionPage() {
  const navigate = useNavigate();
  const mutations = useLibraryCollectionMutations();

  return (
    <>
      <PageHeader title="New collection" description="Create a curated GEOlibrary shelf." />
      <PageBody>
        <CollectionEditor
          collection={createDraftCollection("atlas-studio")}
          submitLabel="Create collection"
          onCancel={() => navigate({ to: "/library/collections" })}
          onSave={(collection) => {
            void fetchLibraryCreators().then((creators) => {
              const curator = creators[0]?.handle ?? collection.curatorHandle;
              mutations.create.mutate(
                { ...collection, curatorHandle: collection.curatorHandle || curator },
                {
                  onSuccess: (created) => {
                    navigate({
                      to: "/library/collections/$collectionId",
                      params: { collectionId: created.id },
                    });
                  },
                },
              );
            });
          }}
        />
      </PageBody>
    </>
  );
}
