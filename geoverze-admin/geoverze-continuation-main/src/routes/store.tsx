import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "GEOstore — GEOverze Admin" },
      {
        name: "description",
        content: "Store orders, fulfilment status and merchandise performance.",
      },
      { property: "og:title", content: "GEOstore — GEOverze Admin" },
      {
        property: "og:description",
        content: "Store orders, fulfilment status and merchandise performance.",
      },
    ],
  }),
  component: StorePage,
});

const sections = [
  { to: "/store", label: "Products", exact: true },
  { to: "/store/orders", label: "Orders", exact: false },
  { to: "/store/coupons", label: "Coupons", exact: false },
  { to: "/store/redemptions", label: "Credit redemptions", exact: false },
] as const;

function StorePage() {
  return (
    <div className="space-y-4">
      <nav
        aria-label="GEOstore sections"
        className="flex flex-wrap gap-1 border-b border-border pb-2"
      >
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            activeOptions={{ exact: section.exact }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
            )}
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
