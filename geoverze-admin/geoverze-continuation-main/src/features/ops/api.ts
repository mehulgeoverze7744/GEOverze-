import { supabase } from "@/lib/supabase/client";
import { throwOnError } from "@/lib/supabase/query";
import type { Json } from "@/lib/supabase/database.types";

export async function fetchContentReports() {
  return throwOnError(
    await supabase.from("content_reports").select("*").order("created_at", { ascending: false }),
    "Failed to load reports",
  );
}

export async function updateContentReport(
  id: string,
  patch: { status?: string; assigned_to?: string | null; resolution_note?: string; severity?: string },
) {
  const data = throwOnError(
    await supabase
      .from("content_reports")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single(),
    "Failed to update report",
  );
  await supabase.rpc("admin_write_audit_log", {
    _action: "moderation.report_updated",
    _entity_type: "content_report",
    _entity_id: id,
  });
  return data;
}

export async function createContentReport(input: {
  target_type: string;
  target_id: string;
  reason: string;
  details?: string;
  severity?: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return throwOnError(
    await supabase
      .from("content_reports")
      .insert({
        reporter_id: user?.id ?? null,
        target_type: input.target_type,
        target_id: input.target_id,
        reason: input.reason,
        details: input.details ?? "",
        severity: input.severity ?? "medium",
      })
      .select("*")
      .single(),
    "Failed to create report",
  );
}

export async function fetchSupportTickets() {
  return throwOnError(
    await supabase.from("support_tickets").select("*").order("updated_at", { ascending: false }),
    "Failed to load tickets",
  );
}

export async function fetchTicketMessages(ticketId: string) {
  return throwOnError(
    await supabase
      .from("support_ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at"),
    "Failed to load ticket messages",
  );
}

export async function createSupportTicket(input: {
  subject: string;
  requester_email?: string;
  requester_id?: string | null;
  priority?: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ticket = throwOnError(
    await supabase
      .from("support_tickets")
      .insert({
        subject: input.subject,
        requester_email: input.requester_email ?? user?.email ?? "",
        requester_id: input.requester_id ?? user?.id ?? null,
        priority: input.priority ?? "normal",
      })
      .select("*")
      .single(),
    "Failed to create ticket",
  );
  await supabase.rpc("admin_write_audit_log", {
    _action: "support.ticket_created",
    _entity_type: "support_ticket",
    _entity_id: ticket.id,
  });
  return ticket;
}

export async function updateSupportTicket(
  id: string,
  patch: { status?: string; priority?: string; assigned_to?: string | null },
) {
  return throwOnError(
    await supabase
      .from("support_tickets")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single(),
    "Failed to update ticket",
  );
}

export async function addTicketMessage(ticketId: string, body: string, isInternal = false) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return throwOnError(
    await supabase
      .from("support_ticket_messages")
      .insert({
        ticket_id: ticketId,
        author_id: user?.id ?? null,
        body,
        is_internal: isInternal,
      })
      .select("*")
      .single(),
    "Failed to add message",
  );
}

export async function fetchAdminNotifications() {
  return throwOnError(
    await supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }),
    "Failed to load notifications",
  );
}

export async function upsertAdminNotification(input: {
  id?: string;
  title: string;
  body: string;
  audience: "all" | "creators" | "subscribers" | "admins";
  channel: "in_app" | "email";
  status: "draft" | "sent";
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const payload = {
    title: input.title,
    body: input.body,
    audience: input.audience,
    channel: input.channel,
    status: input.status,
    created_by: user?.id ?? null,
    sent_at: input.status === "sent" ? new Date().toISOString() : null,
  };
  const query = input.id
    ? supabase.from("admin_notifications").update(payload).eq("id", input.id).select("*").single()
    : supabase.from("admin_notifications").insert(payload).select("*").single();
  return throwOnError(await query, "Failed to save notification");
}

export async function fetchAuditLogs() {
  return throwOnError(
    await supabase.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(500),
    "Failed to load audit logs",
  );
}

export async function fetchPlatformSettings() {
  return throwOnError(
    await supabase.from("platform_settings").select("*").order("key"),
    "Failed to load settings",
  );
}

export async function setPlatformSetting(key: string, value: Json) {
  return throwOnError(
    await supabase.rpc("admin_set_platform_setting", { _key: key, _value: value }),
    "Failed to save setting",
  );
}

export async function fetchRoleCounts() {
  const rows = throwOnError(
    await supabase.from("user_roles").select("role"),
    "Failed to load roles",
  );
  const counts: Record<string, number> = { user: 0, creator: 0, admin: 0, super_admin: 0 };
  for (const row of rows) counts[row.role] = (counts[row.role] ?? 0) + 1;
  return counts;
}

export async function fetchLibraryCreators() {
  return throwOnError(
    await supabase.from("library_creators").select("*").order("updated_at", { ascending: false }),
    "Failed to load library creators",
  );
}
