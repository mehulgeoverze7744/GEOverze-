/**
 * Creates a Razorpay subscription for an authenticated GVRZE member.
 *
 * This Edge Function remains for production deployments. Local checkout uses
 * createRazorpaySubscriptionFn (TanStack server function) so `npm run dev`
 * works without deploying functions.
 *
 * Deploy:
 *   npx supabase functions deploy create-razorpay-subscription --project-ref hcxifkgzugxqijttmpzc
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_API = "https://api.razorpay.com/v1";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return json({ error: "Sign in to continue to checkout.", code: "AUTH_REQUIRED" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("VITE_SUPABASE_ANON_KEY") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: auth } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: "Sign in to continue to checkout.", code: "AUTH_REQUIRED" }, 401);
  }

  let body: {
    plan_tier?: string;
    billing_interval?: string;
    idempotency_key?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON", code: "PARSE_ERROR" }, 400);
  }

  const planTier = body.plan_tier;
  const interval = body.billing_interval;
  if (!planTier || !interval) {
    return json({ error: "plan_tier and billing_interval are required.", code: "VALIDATION" }, 400);
  }

  return json({
    error:
      "Use the GVRZE app checkout (createRazorpaySubscriptionFn). " +
      "This Edge Function is a production shim — deploy after wiring Razorpay plan IDs.",
    code: "USE_APP_CHECKOUT",
  }, 501);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
