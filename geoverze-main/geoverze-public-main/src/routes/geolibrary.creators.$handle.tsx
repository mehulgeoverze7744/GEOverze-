import { Navigate, createFileRoute } from "@tanstack/react-router";

import { CreatorScreen } from "@/features/library";
import {
  GVRZE_STUDIO_HANDLE,
  creatorByHandle,
  isLegacyLibraryCreatorHandle,
} from "@/features/library/data/creators";

export const Route = createFileRoute("/geolibrary/creators/$handle")({
  head: ({ params }) => {
    const creator = isLegacyLibraryCreatorHandle(params.handle)
      ? creatorByHandle(GVRZE_STUDIO_HANDLE)
      : creatorByHandle(params.handle);
    if (!creator) {
      return {
        meta: [{ title: "Creator not found — GVRZE Library" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${creator.name} — GVRZE Library creator`;
    return {
      meta: [
        { title },
        { name: "description", content: creator.bio },
        { property: "og:title", content: title },
        { property: "og:description", content: creator.bio },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          property: "og:url",
          content: `https://geoverze.com/geolibrary/creators/${creator.handle}`,
        },
      ],
      links: [
        { rel: "canonical", href: `https://geoverze.com/geolibrary/creators/${creator.handle}` },
      ],
    };
  },
  component: CreatorRoute,
});

function CreatorRoute() {
  const { handle } = Route.useParams();
  if (isLegacyLibraryCreatorHandle(handle)) {
    return (
      <Navigate to="/geolibrary/creators/$handle" params={{ handle: GVRZE_STUDIO_HANDLE }} replace />
    );
  }
  return <CreatorScreen />;
}
