import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscription Management — GEOverze Admin" },
      {
        name: "description",
        content: "Plans, pricing, subscriber directory and recurring revenue for GEOverze.",
      },
      { property: "og:title", content: "Subscription Management — GEOverze Admin" },
      {
        property: "og:description",
        content: "Plans, subscribers, MRR and billing analytics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscriptionsLayout,
});

const sections = [
  { to: "/subscriptions", label: "Plans", exact: true },
  { to: "/subscriptions/subscribers", label: "Subscribers", exact: false },
  { to: "/subscriptions/analytics", label: "Analytics", exact: false },
] as const;

function SubscriptionsLayout() {
  return (
    <div className="space-y-4">
      <nav
        aria-label="Subscription sections"
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
