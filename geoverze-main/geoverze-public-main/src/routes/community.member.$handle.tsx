import { createFileRoute } from "@tanstack/react-router";

import { MemberProfileScreen } from "@/features/community";
import { memberByHandle } from "@/features/community/data/members";

export const Route = createFileRoute("/community/member/$handle")({
  head: ({ params }) => {
    const member = memberByHandle(params.handle);
    const title = member
      ? `${member.name} (@${member.handle}) — GEOverze Community`
      : `@${params.handle} — GEOverze Community`;
    const description = member
      ? `${member.bio} Level ${member.level} ${member.levelTitle} from ${member.country}.`
      : `Explorer profile for @${params.handle} on GEOverze.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: MemberRoute,
});

function MemberRoute() {
  const { handle } = Route.useParams();
  return <MemberProfileScreen handle={handle} />;
}
