import { useEffect, useState, type ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationDrawer } from "@/components/layout/notification-drawer";
import { TopBar } from "@/components/layout/top-bar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InspectorProvider, useInspector } from "@/context/inspector";
import { SideDrawer } from "@/components/shared/side-drawer";
import { useTheme } from "@/hooks/use-theme";
import { notifications } from "@/lib/mock-data";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <InspectorProvider>
        <ShellFrame>{children}</ShellFrame>
      </InspectorProvider>
    </TooltipProvider>
  );
}

function ShellFrame({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const inspector = useInspector();

  // "/" focuses global search, the enterprise convention.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable === true;
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <div className="hidden shrink-0 lg:block">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar
            collapsed={false}
            onToggle={() => setMobileNav(false)}
            onNavigate={() => setMobileNav(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          onOpenCommand={() => setCommandOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenMobileNav={() => setMobileNav(true)}
          unreadCount={unreadCount}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 lg:p-6">{children}</div>
        </main>
      </div>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} />

      <SideDrawer
        open={inspector.open}
        onOpenChange={inspector.setOpen}
        title={inspector.content?.title ?? ""}
        description={inspector.content?.description}
        footer={inspector.content?.footer}
      >
        {inspector.content?.body}
      </SideDrawer>
    </div>
  );
}
