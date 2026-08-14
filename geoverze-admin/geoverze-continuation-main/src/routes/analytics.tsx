import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — GEOverze Admin" },
      {
        name: "description",
        content: "Executive KPIs and business intelligence across every GEOverze module.",
      },
      { property: "og:title", content: "Analytics — GEOverze Admin" },
      {
        property: "og:description",
        content: "Executive KPIs and business intelligence across every GEOverze module.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsLayout,
});

const sections = [
  { to: "/analytics", label: "Executive overview", exact: true },
  { to: "/analytics/reports", label: "Business intelligence", exact: false },
] as const;

function AnalyticsLayout() {
  return (
    <div className="space-y-4">
      <nav
        aria-label="Analytics sections"
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
