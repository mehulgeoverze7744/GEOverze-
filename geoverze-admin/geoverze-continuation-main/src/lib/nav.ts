import {
  LayoutDashboard,
  Users,
  UserCog,
  ListChecks,
  Database,
  BookOpen,
  ShoppingBag,
  ShieldAlert,
  Trophy,
  Gift,
  CreditCard,
  Banknote,
  Coins,
  Flag,
  LifeBuoy,
  Bell,
  BarChart3,
  KeyRound,
  ScrollText,
  Settings,
  Activity,
  UsersRound,
  LayoutGrid,
  Store,
  Gavel,
  Server,
  type LucideIcon,
} from "lucide-react";

/** A single navigable destination in the admin console. */
export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  keywords?: string | undefined;
  badge?: string | undefined;
}

/** A top-level sidebar group. Groups with a `url` and no children act as links. */
export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  url?: string | undefined;
  items?: NavItem[] | undefined;
}

export const navigation: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    url: "/",
  },
  {
    id: "users",
    label: "User Management",
    icon: UsersRound,
    items: [
      { title: "Users", url: "/users", icon: Users, keywords: "accounts members people" },
      { title: "Creators", url: "/creators", icon: UserCog, keywords: "authors applications" },
      { title: "Roles & Permissions", url: "/roles", icon: KeyRound, keywords: "access rbac" },
    ],
  },
  {
    id: "content",
    label: "Content Management",
    icon: LayoutGrid,
    items: [
      { title: "Quizzes", url: "/quizzes", icon: ListChecks, keywords: "games rounds" },
      { title: "Question Bank", url: "/questions", icon: Database, keywords: "items" },
      { title: "GEOlibrary", url: "/library", icon: BookOpen, keywords: "articles posts" },
      {
        title: "Collections",
        url: "/library/collections",
        icon: BookOpen,
        keywords: "shelves curated groups",
      },
      {
        title: "Library Creators",
        url: "/library/creators",
        icon: UserCog,
        keywords: "personas authors geolibrary",
      },
      { title: "Achievements", url: "/achievements", icon: Trophy, keywords: "badges" },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    icon: Store,
    items: [
      { title: "GEOstore", url: "/store", icon: ShoppingBag, keywords: "orders products" },
      {
        title: "Subscriptions",
        url: "/subscriptions",
        icon: CreditCard,
        keywords: "plans billing",
      },
      { title: "Payments", url: "/payments", icon: Banknote, keywords: "transactions payouts" },
      { title: "Rewards", url: "/rewards", icon: Gift, keywords: "credits campaigns" },
      { title: "Credits", url: "/credits", icon: Coins, keywords: "ledger economy balance" },
    ],
  },
  {
    id: "moderation",
    label: "Moderation",
    icon: Gavel,
    items: [
      {
        title: "Community Queue",
        url: "/moderation",
        icon: ShieldAlert,
        keywords: "review flags cases appeals",
      },
      { title: "Reports", url: "/reports", icon: Flag, keywords: "abuse" },
      { title: "Support", url: "/support", icon: LifeBuoy, keywords: "tickets helpdesk" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    items: [
      { title: "Overview", url: "/analytics", icon: BarChart3, keywords: "metrics insights" },
      {
        title: "Business Intelligence",
        url: "/analytics/reports",
        icon: BarChart3,
        keywords: "reports bi usage revenue geography",
      },
      { title: "Audit Logs", url: "/audit-logs", icon: ScrollText, keywords: "trail history" },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    icon: Server,
    items: [
      { title: "Notifications", url: "/notifications", icon: Bell, keywords: "broadcast" },
      {
        title: "Monitoring",
        url: "/monitoring",
        icon: Activity,
        keywords: "health uptime performance sessions storage",
      },
      { title: "System Settings", url: "/settings", icon: Settings, keywords: "flags config" },
    ],
  },
];

/** Flat list of every destination — used by search, palette and breadcrumbs. */
export const navItems: NavItem[] = navigation.flatMap(
  (group) =>
    group.items ?? (group.url ? [{ title: group.label, url: group.url, icon: group.icon }] : []),
);

/** Legacy shape kept for pages that still consume grouped label/items pairs. */
export const navGroups = navigation.map((group) => ({
  label: group.label,
  items:
    group.items ?? (group.url ? [{ title: group.label, url: group.url, icon: group.icon }] : []),
}));

export function isItemActive(pathname: string, url: string): boolean {
  return url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(`${url}/`);
}

export function findNavItem(pathname: string): { group: NavGroup; item: NavItem } | undefined {
  for (const group of navigation) {
    for (const item of group.items ?? []) {
      if (isItemActive(pathname, item.url)) return { group, item };
    }
  }
  return undefined;
}
