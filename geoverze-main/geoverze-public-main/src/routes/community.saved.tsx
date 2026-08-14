import { createFileRoute } from "@tanstack/react-router";

import { SavedScreen } from "@/features/community";

const title = "Saved posts — GEOverze Community";
const description = "The community posts, questions and creator updates you kept for later.";

export const Route = createFileRoute("/community/saved")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedScreen,
});
