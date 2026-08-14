import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { initAuthSync } from "@/lib/supabase/auth-sync";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { UniverseBackground } from "@/components/layout/UniverseBackground";
import { GeoButton } from "@/components/shared/GeoButton";
import { OfflineNotice } from "@/components/shared/OfflineNotice";
import { Toaster } from "@/components/ui/sonner";

import { NotFoundPage } from "@/features/errors";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">Signal lost</p>
      <h1 className="mt-6 text-xl font-light tracking-tight text-foreground">
        This page didn't load
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/50">
        Something went wrong on our end. You can try again or head back home.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <GeoButton
          variant="primary"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </GeoButton>
        <GeoButton asChild variant="secondary">
          <a href="/">Go home</a>
        </GeoButton>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GEOverze — Know Earth. Think Global." },
      {
        name: "description",
        content:
          "GEOverze is a cinematic geography universe — explore, learn and compete your way across the planet.",
      },
      { name: "author", content: "GEOverze" },
      { property: "og:site_name", content: "GEOverze" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      {
        href: "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&display=swap",
        rel: "stylesheet",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "GEOverze",
          slogan: "Know Earth. Think Global.",
          url: "https://geoverze.com",
          description:
            "GEOverze is a cinematic geography universe — explore, learn and compete your way across the planet.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Restores the Supabase session (if any) and keeps useAuthStore in sync for
  // the lifetime of the app. Guarded internally, so this is safe to call on
  // every render/remount.
  useEffect(() => {
    initAuthSync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UniverseBackground />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[var(--z-skip)] focus:rounded-full focus:border focus:border-bronze/50 focus:bg-charcoal focus:px-5 focus:py-3 focus:text-[0.7rem] focus:uppercase focus:tracking-[var(--tracking-button)] focus:text-bronze"
        >
          Skip to content
        </a>
        <div className="relative flex min-h-dvh flex-col">
          <Navbar />
          <main id="main" className="flex-1">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
          <Footer />
        </div>
        <OfflineNotice />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
