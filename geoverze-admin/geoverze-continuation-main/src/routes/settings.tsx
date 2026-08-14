import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "System Settings — GEOverze Admin" },
      {
        name: "description",
        content: "Global configuration, branding, platform rules, security and integrations.",
      },
      { property: "og:title", content: "System Settings — GEOverze Admin" },
      {
        property: "og:description",
        content: "Global configuration, branding, platform rules, security and integrations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsLayout,
});

const sections = [
  { to: "/settings", label: "General", exact: true },
  { to: "/settings/branding", label: "Branding", exact: false },
  { to: "/settings/rules", label: "Platform rules", exact: false },
  { to: "/settings/community", label: "Community", exact: false },
  { to: "/settings/security", label: "Security", exact: false },
  { to: "/settings/integrations", label: "Integrations", exact: false },
] as const;

function SettingsLayout() {
  return (
    <div className="space-y-4">
      <nav
        aria-label="Settings sections"
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
