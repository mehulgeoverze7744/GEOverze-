import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { libraryResources } from "@/features/library/data";
import { ResourceEditor, createDraftResource } from "@/features/library/resource-editor";
import { useLibraryActions } from "@/features/library/use-library-actions";

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
  const actions = useLibraryActions(libraryResources);

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
            actions.save(resource);
            navigate({ to: "/library" });
          }}
        />
      </PageBody>
    </>
  );
}
