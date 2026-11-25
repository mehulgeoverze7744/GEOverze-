/**
 * Shared commerce notification ledger (Resend / SMS) — server-only.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type CommerceNoticeKind =
  | "gstore_order"
  | "subscription"
  | "gstore_shipment_created"
  | "gstore_shipment_picked_up"
  | "gstore_shipment_in_transit"
  | "gstore_shipment_out_for_delivery"
  | "gstore_shipment_delivered"
  | "gstore_shipment_exception"
  | "gstore_order_cancelled"
  | "gstore_order_refunded";

export type CommerceNoticeChannel = "email" | "sms";

export const COMMERCE_NOTICE_MAX_ATTEMPTS = 5;

type ClaimResult = "claimed" | "duplicate" | "unavailable";

type SendResult = {
  ok: boolean;
  error?: string;
  skipped?: string;
  providerMessageId?: string;
};

export function formatInrPaise(minor: number): string {
  const rupees = minor / 100;
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function escapeHtmlForEmail(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function claimNotice(
  client: SupabaseClient,
  kind: CommerceNoticeKind,
  sourceId: string,
  channel: CommerceNoticeChannel,
): Promise<ClaimResult> {
  const { error } = await client.from("commerce_notifications").insert({
    kind,
    source_id: sourceId,
    channel,
    status: "pending",
  });
  if (!error) return "claimed";
  if (error.code === "23505") {
    const { data: existing } = await client
      .from("commerce_notifications")
      .select("status, attempt_count")
      .eq("kind", kind)
      .eq("source_id", sourceId)
      .eq("channel", channel)
      .maybeSingle();
    if (
      existing?.status === "failed" &&
      Number(existing.attempt_count ?? 0) < COMMERCE_NOTICE_MAX_ATTEMPTS
    ) {
      const { error: retryErr } = await client
        .from("commerce_notifications")
        .update({
          status: "pending",
          error: null,
          attempt_count: Number(existing.attempt_count ?? 0) + 1,
        })
        .eq("kind", kind)
        .eq("source_id", sourceId)
        .eq("channel", channel)
        .eq("status", "failed");
      if (!retryErr) return "claimed";
    }
    return "duplicate";
  }
  if (error.message?.includes("commerce_notifications") || error.code === "42P01") {
    console.warn("[commerce-notifications] table missing — apply migration 20261114180000.");
    return "unavailable";
  }
  console.error("[commerce-notifications] claim failed:", error.message);
  return "unavailable";
}

async function markNotice(
  client: SupabaseClient,
  kind: CommerceNoticeKind,
  sourceId: string,
  channel: CommerceNoticeChannel,
  status: "sent" | "failed" | "skipped",
  errorMessage?: string,
  providerMessageId?: string,
) {
  const { error } = await client
    .from("commerce_notifications")
    .update({
      status,
      error: errorMessage ?? null,
      sent_at: status === "sent" ? new Date().toISOString() : null,
      provider_message_id: providerMessageId ?? null,
    })
    .eq("kind", kind)
    .eq("source_id", sourceId)
    .eq("channel", channel);
  if (error) console.error("[commerce-notifications] mark failed:", error.message);
}

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const apiKey = process.env["RESEND_API_KEY"] ?? "";
  const from = process.env["COMMERCE_EMAIL_FROM"] ?? "GVRZE <orders@gvrze.com>";
  if (!apiKey) return { ok: false, skipped: "RESEND_API_KEY is not set" };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return { ok: false, error: `Resend ${response.status}: ${body.slice(0, 240)}` };
  }
  const json = (await response.json().catch(() => null)) as { id?: string } | null;
  return { ok: true, providerMessageId: json?.id };
}

export async function deliverCommerceNotice(
  client: SupabaseClient,
  kind: CommerceNoticeKind,
  sourceId: string,
  channel: CommerceNoticeChannel,
  send: () => Promise<SendResult>,
) {
  const claim = await claimNotice(client, kind, sourceId, channel);
  if (claim !== "claimed") return;
  try {
    const result = await send();
    if (result.skipped) {
      await markNotice(client, kind, sourceId, channel, "skipped", result.skipped);
      console.warn(`[commerce-notifications] ${kind}/${channel} skipped: ${result.skipped}`);
      return;
    }
    if (!result.ok) {
      await markNotice(client, kind, sourceId, channel, "failed", result.error);
      console.error(`[commerce-notifications] ${kind}/${channel} failed:`, result.error);
      return;
    }
    await markNotice(client, kind, sourceId, channel, "sent", undefined, result.providerMessageId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    await markNotice(client, kind, sourceId, channel, "failed", message);
    console.error(`[commerce-notifications] ${kind}/${channel} threw:`, message);
  }
}

export async function retryFailedCommerceNotice(input: {
  client: SupabaseClient;
  kind: CommerceNoticeKind;
  sourceId: string;
  channel: CommerceNoticeChannel;
  send: () => Promise<SendResult>;
}): Promise<"retried" | "skipped"> {
  const { data: row } = await input.client
    .from("commerce_notifications")
    .select("status, attempt_count")
    .eq("kind", input.kind)
    .eq("source_id", input.sourceId)
    .eq("channel", input.channel)
    .maybeSingle();
  if (!row || row.status !== "failed") return "skipped";
  if (Number(row.attempt_count ?? 0) >= COMMERCE_NOTICE_MAX_ATTEMPTS) return "skipped";
  await deliverCommerceNotice(input.client, input.kind, input.sourceId, input.channel, input.send);
  return "retried";
}