import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: "Server is not configured" }, 500);
  }

  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await caller.auth.getUser();
  if (userError || !user) return json({ error: "Unauthorized" }, 401);

  const { data: isSuper, error: roleError } = await caller.rpc("is_super_admin");
  if (roleError || !isSuper) return json({ error: "Forbidden" }, 403);

  const payload = (await req.json().catch(() => ({}))) as {
    email?: string;
    role?: string;
  };
  const email = String(payload.email ?? "").trim().toLowerCase();
  const role = payload.role === "super_admin" ? "super_admin" : "admin";
  if (!email || !email.includes("@")) return json({ error: "A valid email is required" }, 400);

  const admin = createClient(supabaseUrl, serviceKey);
  const invited = await admin.auth.admin.inviteUserByEmail(email);
  let targetId = invited.data.user?.id ?? null;

  if (!targetId) {
    const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    targetId = existing.data.users.find((item) => item.email?.toLowerCase() === email)?.id ?? null;
  }

  if (!targetId) {
    await admin.rpc("admin_write_audit_log", {
      _action: "admin.provision_failed",
      _entity_type: "user",
      _entity_id: email,
      _outcome: "failed",
    });
    return json({ error: invited.error?.message ?? "Could not provision the user" }, 400);
  }

  const grant = await caller.rpc("admin_set_user_role", {
    _user_id: targetId,
    _role: role,
    _grant: true,
  });
  if (grant.error) return json({ error: grant.error.message }, 400);

  await caller.rpc("admin_write_audit_log", {
    _action: "admin.provisioned",
    _entity_type: "user",
    _entity_id: targetId,
    _metadata: { email, role },
  });

  return json({ ok: true, user_id: targetId, role, email });
});
