import { fetchGstoreOrders } from "@/features/commerce/api";
import { fetchAdminNotifications, fetchContentReports, fetchLibraryCreators, fetchSupportTickets } from "@/features/ops/api";
import type { NotificationItem } from "@/types";

function relative(iso: string | null | undefined) {
  if (!iso) return "";
  const delta = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(delta / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export async function fetchAdminInbox(): Promise<NotificationItem[]> {
  const [reports, tickets, creators, orders, broadcasts] = await Promise.all([
    fetchContentReports(),
    fetchSupportTickets(),
    fetchLibraryCreators(),
    fetchGstoreOrders(),
    fetchAdminNotifications(),
  ]);

  const items: NotificationItem[] = [];

  for (const row of reports.filter((item) => item.status === "open" || item.status === "pending").slice(0, 20)) {
    items.push({
      id: `report-${row.id}`,
      title: row.reason,
      description: `${row.target_type} · ${row.severity}`,
      category: "Reports",
      time: relative(row.created_at),
      unread: true,
    });
  }

  for (const row of tickets.filter((item) => item.status === "open" || item.status === "pending").slice(0, 20)) {
    items.push({
      id: `ticket-${row.id}`,
      title: row.subject,
      description: row.requester_email ?? "Support ticket",
      category: "Support Tickets",
      time: relative(row.updated_at),
      unread: true,
    });
  }

  for (const row of creators.filter((item) => !item.verified).slice(0, 20)) {
    items.push({
      id: `creator-${row.handle}`,
      title: `${row.display_name} applied`,
      description: `@${row.handle}`,
      category: "Creator Requests",
      time: relative(row.updated_at),
      unread: true,
    });
  }

  for (const row of orders.slice(0, 12)) {
    items.push({
      id: `order-${row.id}`,
      title: `Order ${row.order_number}`,
      description: `${row.customer_name} · ${row.order_status}`,
      category: "Platform Alerts",
      time: relative(row.created_at),
      unread: row.order_status === "paid" || row.order_status === "confirmed",
    });
  }

  for (const row of broadcasts.slice(0, 12)) {
    items.push({
      id: `notice-${row.id}`,
      title: row.title,
      description: row.body,
      category: "System Alerts",
      time: relative(row.sent_at ?? row.created_at),
      unread: row.status !== "sent",
    });
  }

  return items;
}
