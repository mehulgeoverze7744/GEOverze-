import { createFileRoute } from "@tanstack/react-router";

import { TopicScreen } from "@/features/community";
import { topicBySlug } from "@/features/community/data/topics";

export const Route = createFileRoute("/community/topic/$slug")({
  head: ({ params }) => {
    const topic = topicBySlug(params.slug);
    const title = topic
      ? `#${topic.slug} — GEOverze Community`
      : `#${params.slug} — GEOverze Community`;
    const description = topic
      ? `${topic.blurb} Join the GEOverze discussion on ${topic.label.toLowerCase()}.`
      : `Community discussion tagged #${params.slug} on GEOverze.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: TopicRoute,
});

function TopicRoute() {
  const { slug } = Route.useParams();
  return <TopicScreen slug={slug} />;
}
