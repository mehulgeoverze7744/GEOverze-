/**
 * Server-only order / subscription confirmation email + SMS.
 *
 * Delivery is fire-and-forget from payment verification. Failures are logged
 * and never reverse a paid order. Rows in `commerce_notifications` make
 * webhook retries and page refreshes idempotent.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type CommerceNoticeKind = "gstore_order" | "subscription";
export type CommerceNoticeChannel = "email" | "sms";

type ClaimResult = "claimed" | "duplicate" | "unavailable";

function serviceClient(): SupabaseClient | null {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
  const serviceRole = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

function siteOrigin(): string {
  return (
    process.env["PUBLIC_SITE_URL"] ??
    process.env["VITE_PUBLIC_SITE_URL"] ??
    "https://gvrze.com"
  ).replace(/\/$/, "");
}

function formatInrPaise(minor: number): string {
  const rupees = minor / 100;
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return digits.startsWith("+") ? digits : `+${digits}`;
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
  if (error.code === "23505") return "duplicate";
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
) {
  const { error } = await client
    .from("commerce_notifications")
    .update({
      status,
      error: errorMessage ?? null,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    })
    .eq("kind", kind)
    .eq("source_id", sourceId)
    .eq("channel", channel);
  if (error) console.error("[commerce-notifications] mark failed:", error.message);
}

async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string; skipped?: string }> {
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
  return { ok: true };
}

async function sendSms(to: string, body: string): Promise<{ ok: boolean; error?: string; skipped?: string }> {
  const provider = (process.env["COMMERCE_SMS_PROVIDER"] ?? "").trim().toLowerCase();
  if (!provider) {
    return {
      ok: false,
      skipped:
        "COMMERCE_SMS_PROVIDER is not set (use twilio or msg91) plus matching credentials",
    };
  }

  if (provider === "twilio") {
    const sid = process.env["TWILIO_ACCOUNT_SID"] ?? "";
    const token = process.env["TWILIO_AUTH_TOKEN"] ?? "";
    const from = process.env["TWILIO_FROM_NUMBER"] ?? "";
    if (!sid || !token || !from) {
      return { ok: false, skipped: "TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER required" };
    }
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return { ok: false, error: `Twilio ${response.status}: ${text.slice(0, 240)}` };
    }
    return { ok: true };
  }

  if (provider === "msg91") {
    const authKey = process.env["MSG91_AUTH_KEY"] ?? "";
    const sender = process.env["MSG91_SENDER_ID"] ?? "GVRZE";
    if (!authKey) return { ok: false, skipped: "MSG91_AUTH_KEY is not set" };
    const mobile = to.replace(/^\+/, "");
    const response = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: process.env["MSG91_TEMPLATE_ID"] ?? "",
        sender,
        short_url: "0",
        recipients: [{ mobiles: mobile, var1: body }],
      }),
    });
    if (!response.ok) {
      const fallback = await fetch(
        `https://api.msg91.com/api/sendhttp.php?authkey=${encodeURIComponent(authKey)}&mobiles=${encodeURIComponent(mobile)}&message=${encodeURIComponent(body)}&sender=${encodeURIComponent(sender)}&route=4&country=91`,
      );
      if (!fallback.ok) {
        const text = await fallback.text().catch(() => "");
        return { ok: false, error: `MSG91 ${fallback.status}: ${text.slice(0, 240)}` };
      }
    }
    return { ok: true };
  }

  return { ok: false, skipped: `Unknown COMMERCE_SMS_PROVIDER "${provider}"` };
}

async function deliver(
  client: SupabaseClient,
  kind: CommerceNoticeKind,
  sourceId: string,
  channel: CommerceNoticeChannel,
  send: () => Promise<{ ok: boolean; error?: string; skipped?: string }>,
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
    await markNotice(client, kind, sourceId, channel, "sent");
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    await markNotice(client, kind, sourceId, channel, "failed", message);
    console.error(`[commerce-notifications] ${kind}/${channel} threw:`, message);
  }
}

type OrderItemRow = {
  product_name: string;
  product_slug: string;
  options: Record<string, string> | null;
  quantity: number;
  unit_price_minor: number;
  line_total_minor: number;
};

function optionLabel(options: Record<string, string> | null): string {
  if (!options) return "";
  return Object.entries(options)
    .map(([key, value]) => `${key} ${value}`)
    .join(", ");
}

export function schedulePaidGstoreOrderNotifications(orderId: string): void {
  void notifyPaidGstoreOrder(orderId);
}

export async function notifyPaidGstoreOrder(orderId: string): Promise<void> {
  const client = serviceClient();
  if (!client || !orderId) return;

  const { data: order, error } = await client
    .from("gstore_orders")
    .select(
      `
      id, order_number, payment_status, order_status, currency,
      customer_name, customer_email, customer_phone,
      shipping_name, shipping_line1, shipping_line2, shipping_city,
      shipping_state, shipping_pincode, shipping_country, shipping_method,
      subtotal_minor, shipping_minor, tax_minor, discount_minor, total_minor,
      gstore_order_items (
        product_name, product_slug, options, quantity, unit_price_minor, line_total_minor
      )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    console.error("[commerce-notifications] order lookup failed:", error?.message);
    return;
  }
  if (order.payment_status !== "paid") return;

  const items = (order.gstore_order_items ?? []) as OrderItemRow[];
  const email = String(order.customer_email ?? "").trim();
  const phone = normalizePhone(order.customer_phone);
  const origin = siteOrigin();
  const itemLines = items
    .map((item) => {
      const variant = optionLabel(item.options);
      return `${item.quantity}× ${item.product_name}${variant ? ` (${variant})` : ""} — ${formatInrPaise(item.line_total_minor)}`;
    })
    .join("\n");
  const itemHtml = items
    .map((item) => {
      const variant = optionLabel(item.options);
      return `<li>${item.quantity}× ${escapeHtml(item.product_name)}${variant ? ` <span style="color:#555">(${escapeHtml(variant)})</span>` : ""} — ${formatInrPaise(item.line_total_minor)}</li>`;
    })
    .join("");
  const shipping = [
    order.shipping_name,
    order.shipping_line1,
    order.shipping_line2,
    `${order.shipping_city}, ${order.shipping_state} ${order.shipping_pincode}`,
    order.shipping_country,
  ]
    .filter(Boolean)
    .join(", ");

  const text = [
    `GVRZE order ${order.order_number} is confirmed.`,
    "",
    itemLines,
    "",
    `Subtotal (GST-inclusive): ${formatInrPaise(Number(order.subtotal_minor))}`,
    `GST (included): ${formatInrPaise(Number(order.tax_minor))}`,
    `Shipping: ${formatInrPaise(Number(order.shipping_minor))}`,
    Number(order.discount_minor) > 0 ? `Discount: −${formatInrPaise(Number(order.discount_minor))}` : "",
    `Total paid: ${formatInrPaise(Number(order.total_minor))}`,
    `Status: ${order.order_status}`,
    `Ship to: ${shipping}`,
    "",
    `View order: ${origin}/geostore/orders`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>Thanks for your GVRZE order <strong>${escapeHtml(order.order_number)}</strong>.</p>
    <ul>${itemHtml}</ul>
    <p>
      Subtotal (GST-inclusive): ${formatInrPaise(Number(order.subtotal_minor))}<br/>
      GST (included in prices): ${formatInrPaise(Number(order.tax_minor))}<br/>
      Shipping: ${formatInrPaise(Number(order.shipping_minor))}<br/>
      ${Number(order.discount_minor) > 0 ? `Discount: −${formatInrPaise(Number(order.discount_minor))}<br/>` : ""}
      <strong>Total paid: ${formatInrPaise(Number(order.total_minor))}</strong>
    </p>
    <p>Status: ${escapeHtml(String(order.order_status))}<br/>Ship to: ${escapeHtml(shipping)}</p>
    <p><a href="${origin}/geostore/orders">Manage your order</a></p>
  `;

  if (email) {
    await deliver(client, "gstore_order", orderId, "email", () =>
      sendResendEmail({
        to: email,
        subject: `GVRZE order ${order.order_number} confirmed`,
        html,
        text,
      }),
    );
  }

  if (phone) {
    await deliver(client, "gstore_order", orderId, "sms", () =>
      sendSms(
        phone,
        `GVRZE: order ${order.order_number} confirmed. Total ${formatInrPaise(Number(order.total_minor))}. Thank you.`,
      ),
    );
  }
}

export function schedulePaidSubscriptionNotifications(subscriptionId: string): void {
  void notifyPaidSubscription(subscriptionId);
}

export async function notifyPaidSubscription(subscriptionId: string): Promise<void> {
  const client = serviceClient();
  if (!client || !subscriptionId) return;

  const { data: sub, error } = await client
    .from("user_subscriptions")
    .select("id, user_id, plan_tier, billing_interval, status, current_period_end")
    .eq("id", subscriptionId)
    .maybeSingle();

  if (error || !sub) {
    console.error("[commerce-notifications] subscription lookup failed:", error?.message);
    return;
  }
  if (sub.status !== "active") return;

  const { data: userData } = await client.auth.admin.getUserById(sub.user_id);
  const user = userData?.user;
  const email = user?.email ?? "";
  const phone = normalizePhone(
    user?.phone ??
      (typeof user?.user_metadata?.["phone"] === "string" ? user.user_metadata["phone"] : null),
  );
  const origin = siteOrigin();
  const plan = `${String(sub.plan_tier)} · ${String(sub.billing_interval)}`;
  const nextBill = sub.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "see billing";

  const { data: planRow } = await client
    .from("subscription_plans")
    .select("monthly_price_cents, annual_price_cents")
    .eq("tier", sub.plan_tier)
    .maybeSingle();
  const rupees =
    sub.billing_interval === "annual"
      ? Number(planRow?.annual_price_cents ?? 0)
      : Number(planRow?.monthly_price_cents ?? 0);
  const amountLabel = rupees > 0 ? `₹${rupees.toLocaleString("en-IN")}` : "your plan total";

  const text = [
    `Your GVRZE ${plan} membership is active.`,
    `Amount: ${amountLabel} (GST-inclusive).`,
    `Next billing date: ${nextBill}.`,
    `Manage membership: ${origin}/settings?section=billing`,
  ].join("\n");

  const html = `
    <p>Your GVRZE <strong>${escapeHtml(plan)}</strong> membership is active.</p>
    <p>Amount: ${escapeHtml(amountLabel)} (GST-inclusive).<br/>Next billing date: ${escapeHtml(nextBill)}.</p>
    <p><a href="${origin}/settings?section=billing">Manage membership</a></p>
  `;

  if (email) {
    await deliver(client, "subscription", subscriptionId, "email", () =>
      sendResendEmail({
        to: email,
        subject: "GVRZE membership confirmed",
        html,
        text,
      }),
    );
  }

  if (phone) {
    await deliver(client, "subscription", subscriptionId, "sms", () =>
      sendSms(
        phone,
        `GVRZE: ${plan} membership is active. Next billing ${nextBill}. Manage: ${origin}/settings?section=billing`,
      ),
    );
  } else {
    console.warn("[commerce-notifications] subscription SMS skipped — no phone on the account");
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
