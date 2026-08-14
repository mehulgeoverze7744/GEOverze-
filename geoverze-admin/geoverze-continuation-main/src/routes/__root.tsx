import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { initAuthSync, signOut } from "@/lib/supabase/auth-sync";
import { isPrivilegedRole } from "@/lib/supabase/client";
import { selectIsSignedIn, selectRole, useAuthStore } from "@/stores/authStore";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GEOverze Admin" },
      { name: "description", content: "Internal operations console for the GEOverze platform." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Admin access gate.
 *
 * `/login` always renders un-gated (there is nothing to protect there). Every
 * other route requires a signed-in Supabase session AND a role of "admin" or
 * "super_admin" resolved from public.user_roles — that lookup runs a fresh,
 * RLS-scoped database query on every load, so a user cannot grant themselves
 * access by editing localStorage, Zustand state, or app JavaScript. See the
 * Phase 2A report for the residual caveat: this is client-side route
 * rendering, not a network boundary — real protection for future admin-only
 * data comes from RLS on those tables, not from this component.
 */
function AdminGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const signedIn = useAuthStore(selectIsSignedIn);
  const role = useAuthStore(selectRole);
  const roleChecked = useAuthStore((s) => s.roleChecked);

  useEffect(() => {
    initAuthSync();
  }, []);

  // The login page renders standalone (no dashboard chrome) and is never
  // gated — it's the one place a signed-out visitor needs to reach.
  if (pathname === "/login") return <Outlet />;

  if (!signedIn || !roleChecked) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-foreground">Sign in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {roleChecked || !signedIn
              ? "This console is restricted to authorized administrators."
              : "Checking your account…"}
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/login">Go to sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isPrivilegedRole(role)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-foreground">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in but does not hold an admin role for GEOverze. Contact a super
            admin if you believe this is a mistake.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                void signOut().then(() => router.navigate({ to: "/login" }));
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </AppShell>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AdminGate />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
