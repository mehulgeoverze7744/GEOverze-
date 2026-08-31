import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { CreatorPersonaEditor } from "@/features/library/creator-personas/components/CreatorPersonaEditor";
import { createDraftCreatorPersona } from "@/features/library/creator-personas/data/creator-persona-mutations";
import { useLibraryCreatorMutations } from "@/features/library/creator-personas/hooks/useLibraryCreatorMutations";

export const Route = createFileRoute("/library/creators/new")({
  component: NewLibraryCreatorPage,
});

function NewLibraryCreatorPage() {
  const navigate = useNavigate();
  const mutations = useLibraryCreatorMutations();

  return (
    <>
      <PageHeader title="New creator" description="Create a GEOlibrary creator persona." />
      <PageBody>
        <CreatorPersonaEditor
          persona={createDraftCreatorPersona()}
          isNew
          submitLabel="Create creator"
          onCancel={() => navigate({ to: "/library/creators" })}
          onSave={(persona) => {
            mutations.create.mutate(persona, {
              onSuccess: (created) => {
                navigate({
                  to: "/library/creators/$handle",
                  params: { handle: created.handle },
                });
              },
            });
          }}
        />
      </PageBody>
    </>
  );
}
