import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { useLibraryMutations } from "@/features/library/hooks/useLibraryMutations";
import { ResourceEditor, createDraftResource } from "@/features/library/resource-editor";

export const Route = createFileRoute("/library/new")({
  head: () => ({
    meta: [
      { title: "New Library Resource — GEOverze Admin" },
      {
        name: "description",
        content: "Create a GEOlibrary article, map, infographic or PDF with SEO and media.",
      },
      { property: "og:title", content: "New Library Resource — GEOverze Admin" },
      {
        property: "og:description",
        content: "Enterprise editor for new GEOlibrary resources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewResourcePage,
});

function NewResourcePage() {
  const navigate = useNavigate();
  const mutations = useLibraryMutations();

  return (
    <>
      <PageHeader
        title="New resource"
        description="Draft a GEOlibrary resource — content, media, SEO and publishing in one place."
      />
      <PageBody>
        <ResourceEditor
          resource={createDraftResource()}
          submitLabel="Create resource"
          onCancel={() => navigate({ to: "/library" })}
          onSave={(resource) => {
            mutations.create.mutate(resource, {
              onSuccess: (created) => {
                navigate({ to: "/library/$resourceId", params: { resourceId: created.id } });
              },
            });
          }}
        />
      </PageBody>
    </>
  );
}
