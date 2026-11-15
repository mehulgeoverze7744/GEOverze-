import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { ResourcePage } from "@/components/shared/resource-page";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge";
import { InspectorField } from "@/components/shared/inspector-panel";
import type { DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addTicketMessage,
  createSupportTicket,
  fetchSupportTickets,
  fetchTicketMessages,
  updateSupportTicket,
} from "@/features/ops/api";
import { adminKeys } from "@/lib/admin/keys";
import { useAdminQuery } from "@/lib/admin/hooks";
import { useAdminRealtime } from "@/lib/admin/realtime";
import type { Status } from "@/types";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [{ title: "Support — GVRZE Admin" }],
  }),
  component: SupportPage,
});

type LiveTicket = {
  id: string;
  subject: string;
  requester: string;
  channel: string;
  priority: string;
  status: Status;
  updatedAt: string;
};

const columns: DataTableColumn<LiveTicket>[] = [
  {
    id: "id",
    header: "Ticket",
    accessor: (r) => r.id,
    cell: (r) => <code className="font-mono text-xs">{r.id.slice(0, 8)}</code>,
  },
  { id: "subject", header: "Subject", accessor: (r) => r.subject },
  { id: "requester", header: "Requester", accessor: (r) => r.requester },
  { id: "channel", header: "Channel", accessor: (r) => r.channel },
  {
    id: "priority",
    header: "Priority",
    accessor: (r) => r.priority,
    cell: (r) => <SeverityBadge level={r.priority} />,
  },
  {
    id: "status",
    header: "Status",
    accessor: (r) => r.status,
    cell: (r) => <StatusBadge status={r.status} />,
  },
  { id: "updatedAt", header: "Updated", accessor: (r) => r.updatedAt, align: "right" },
];

function TicketInspector({ ticket }: { ticket: LiveTicket }) {
  const messages = useAdminQuery(adminKeys.ticketMessages(ticket.id), () => fetchTicketMessages(ticket.id));
  return (
    <div className="space-y-3">
      <InspectorField label="Ticket ID" value={<code className="font-mono text-xs">{ticket.id}</code>} />
      <InspectorField label="Requester" value={ticket.requester} />
      <InspectorField label="Channel" value={ticket.channel} />
      <InspectorField label="Priority" value={<SeverityBadge level={ticket.priority} />} />
      <InspectorField label="Status" value={<StatusBadge status={ticket.status} />} />
      <InspectorField label="Updated" value={ticket.updatedAt} />
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Conversation</p>
        {(messages.data ?? []).map((message) => (
          <p key={message.id} className="rounded-md border border-border p-2 text-sm">
            {message.body}
          </p>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const body = window.prompt("Reply");
            if (!body) return;
            void addTicketMessage(ticket.id, body).then(() => {
              toast.success("Reply added.");
              void messages.refetch();
            });
          }}
        >
          Add reply
        </Button>
      </div>
    </div>
  );
}

function SupportPage() {
  const query = useAdminQuery(adminKeys.tickets, fetchSupportTickets);
  useAdminRealtime("support_tickets", [adminKeys.tickets, adminKeys.dashboard]);
  const [subject, setSubject] = useState("");

  const data = useMemo<LiveTicket[]>(
    () =>
      (query.data ?? []).map((row) => ({
        id: row.id,
        subject: row.subject,
        requester: row.requester_email || row.requester_id || "—",
        channel: row.channel,
        priority: row.priority,
        status: row.status as Status,
        updatedAt: row.updated_at,
      })),
    [query.data],
  );

  const createTicket = async () => {
    if (!subject.trim()) {
      toast.error("Enter a subject.");
      return;
    }
    await createSupportTicket({ subject: subject.trim() });
    setSubject("");
    toast.success("Ticket created.");
    void query.refetch();
  };

  return (
    <ResourcePage
      title="Support"
      description="Admin-managed support tickets. Public-app users can file tickets later against this same table."
      data={data}
      loading={query.loading}
      error={query.error}
      onRetry={() => void query.refetch()}
      columns={columns}
      getRowId={(r) => r.id}
      searchPlaceholder="Search tickets…"
      actions={
        <div className="flex items-center gap-2">
          <Input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="New ticket subject"
            className="h-8 w-56"
          />
          <Button size="sm" onClick={() => void createTicket()}>
            <Plus className="size-4" aria-hidden="true" />
            New ticket
          </Button>
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      }
      filters={[
        { id: "priority", label: "Priority", accessor: (r) => r.priority, options: ["low", "normal", "high", "urgent"] },
        { id: "status", label: "Status", accessor: (r) => r.status, options: ["open", "pending", "resolved", "closed"] },
      ]}
      rowActions={[
        {
          label: "Mark resolved",
          onSelect: (row) => {
            void updateSupportTicket(row.id, { status: "resolved" }).then(() => {
              toast.success("Ticket resolved.");
              void query.refetch();
            });
          },
        },
      ]}
      inspectorTitle={(r) => r.subject}
      renderInspector={(r) => <TicketInspector ticket={r} />}
    />
  );
}
