import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/credits")({
  head: () => ({
    meta: [
      { title: "Credit Management — GEOverze Admin" },
      {
        name: "description",
        content: "GEOcredit ledger, earning rules, manual adjustments and economy analytics.",
      },
      { property: "og:title", content: "Credit Management — GEOverze Admin" },
      { property: "og:description", content: "Ledger, rules, adjustments and credit analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreditsLayout,
});

const sections = [
  { to: "/credits", label: "Ledger", exact: true },
  { to: "/credits/rules", label: "Rules", exact: false },
  { to: "/credits/adjustments", label: "Adjustments", exact: false },
  { to: "/credits/analytics", label: "Analytics", exact: false },
] as const;

function CreditsLayout() {
  return (
    <div className="space-y-4">
      <nav
        aria-label="Credit sections"
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
