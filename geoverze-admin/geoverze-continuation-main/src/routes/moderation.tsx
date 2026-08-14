import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/moderation")({
  head: () => ({
    meta: [
      { title: "Community Moderation — GEOverze Admin" },
      {
        name: "description",
        content: "Triage flagged community content across every GEOverze surface.",
      },
      { property: "og:title", content: "Community Moderation — GEOverze Admin" },
      {
        property: "og:description",
        content: "Triage flagged community content across every GEOverze surface.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModerationPage,
});

const sections = [
  { to: "/moderation", label: "User reports", exact: true },
  { to: "/moderation/quizzes", label: "Quiz reports", exact: false },
  { to: "/moderation/creators", label: "Creator reports", exact: false },
  { to: "/moderation/community", label: "Community reports", exact: false },
] as const;

function ModerationPage() {
  return (
    <div className="space-y-4">
      <nav
        aria-label="Moderation queues"
        className="flex flex-wrap gap-1 border-b border-border pb-2"
      >
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            activeOptions={{ exact: section.exact }}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "bg-muted font-medium text-foreground" }}
          >
            {section.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
