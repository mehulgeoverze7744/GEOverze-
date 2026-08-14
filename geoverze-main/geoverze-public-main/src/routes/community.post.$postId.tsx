import { createFileRoute } from "@tanstack/react-router";

import { PostDetailScreen } from "@/features/community";
import { postById } from "@/features/community/data/posts";

export const Route = createFileRoute("/community/post/$postId")({
  head: ({ params }) => {
    const post = postById(params.postId);
    const title = post ? `${post.author} on GEOverze Community` : "Discussion — GEOverze Community";
    const description = post ? post.body.slice(0, 155) : "A GEOverze community discussion.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PostRoute,
});

function PostRoute() {
  const { postId } = Route.useParams();
  return <PostDetailScreen postId={postId} />;
}
