-- Admin platform foundation for the separate GEOverze Admin application.
-- Additive only: no drops, truncates, or rewrites of existing public-app logic.
-- Applied against the SAME database as geoverze-main.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(_user_id, 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.require_admin()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL OR NOT public.is_admin(uid) THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  RETURN uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.require_super_admin()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL OR NOT public.is_super_admin(uid) THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  RETURN uid;
END;
$$;

REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.require_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.require_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.require_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.require_super_admin() TO authenticated;

-- Promote the existing sole administrator to super_admin. Does not create users.
INSERT INTO public.user_roles (user_id, role)
SELECT ur.user_id, 'super_admin'::public.app_role
FROM public.user_roles ur
WHERE ur.role = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles existing
    WHERE existing.role = 'super_admin'
  )
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- New operational tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  outcome text NOT NULL DEFAULT 'success'
    CHECK (outcome IN ('success', 'denied', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_created_at_idx
  ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_logs_actor_id_idx
  ON public.admin_audit_logs (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_logs_entity_idx
  ON public.admin_audit_logs (entity_type, entity_id);

COMMENT ON TABLE public.admin_audit_logs IS
  'Append-only administrator action log. No passwords, tokens, or secrets.';

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT 'null'::jsonb,
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT platform_settings_key_safe CHECK (
    key ~ '^[a-z][a-z0-9_]*$'
    AND key !~* '(secret|password|token|service_role|apikey|api_key|private_key)'
  )
);

COMMENT ON TABLE public.platform_settings IS
  'Non-secret platform configuration. Secret values are rejected by constraint and RPC.';

INSERT INTO public.platform_settings (key, value) VALUES
  ('platform_name', '"GEOverze"'::jsonb),
  ('support_email', '"support@geoverze.com"'::jsonb),
  ('default_locale', '"en-US"'::jsonb),
  ('timezone', '"UTC"'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('feature_quiz_creation', 'true'::jsonb),
  ('feature_library_submissions', 'true'::jsonb),
  ('feature_storefront', 'true'::jsonb),
  ('feature_subscriptions', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  target_type text NOT NULL
    CHECK (target_type IN (
      'profile', 'quiz', 'question', 'library_resource', 'library_creator',
      'gstore_order', 'store_order', 'other'
    )),
  target_id text NOT NULL,
  reason text NOT NULL,
  details text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'pending', 'resolved', 'dismissed')),
  severity text NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  assigned_to uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  resolution_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_reports_status_idx
  ON public.content_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS content_reports_target_idx
  ON public.content_reports (target_type, target_id);

COMMENT ON TABLE public.content_reports IS
  'Moderation reports against existing public-app entities. No parallel content store.';

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  requester_email text NOT NULL DEFAULT '',
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  channel text NOT NULL DEFAULT 'admin'
    CHECK (channel IN ('admin', 'email', 'in_app')),
  assigned_to uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_tickets_status_idx
  ON public.support_tickets (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets (id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_ticket_messages_ticket_idx
  ON public.support_ticket_messages (ticket_id, created_at);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all'
    CHECK (audience IN ('all', 'creators', 'subscribers', 'admins')),
  channel text NOT NULL DEFAULT 'in_app'
    CHECK (channel IN ('in_app', 'email')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent')),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_notifications IS
  'Admin-authored notification records. Public app delivery is not implied until that app consumes this table.';

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.content_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT SELECT, INSERT ON public.support_ticket_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT SELECT ON public.platform_settings TO authenticated;

-- Audit logs: admins read; writes go through RPC only.
CREATE POLICY admin_audit_logs_select_admin
  ON public.admin_audit_logs FOR SELECT TO authenticated
  USING (public.is_admin());

-- Settings: admins read. Writes go through allowlisted RPC.
CREATE POLICY platform_settings_select_admin
  ON public.platform_settings FOR SELECT TO authenticated
  USING (public.is_admin());

-- Reports: users may file and read their own; admins manage all.
CREATE POLICY content_reports_select
  ON public.content_reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.is_admin());

CREATE POLICY content_reports_insert_own
  ON public.content_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid() OR public.is_admin());

CREATE POLICY content_reports_update_admin
  ON public.content_reports FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Support: users own tickets; admins manage all.
CREATE POLICY support_tickets_select
  ON public.support_tickets FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR public.is_admin());

CREATE POLICY support_tickets_insert
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid() OR public.is_admin());

CREATE POLICY support_tickets_update_admin
  ON public.support_tickets FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY support_ticket_messages_select
  ON public.support_ticket_messages FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND t.requester_id = auth.uid() AND is_internal = false
    )
  );

CREATE POLICY support_ticket_messages_insert
  ON public.support_ticket_messages FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (
      is_internal = false
      AND EXISTS (
        SELECT 1 FROM public.support_tickets t
        WHERE t.id = ticket_id AND t.requester_id = auth.uid()
      )
    )
  );

CREATE POLICY admin_notifications_admin_all
  ON public.admin_notifications FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin read policies on existing tables (OR'd with existing own-row policies)
-- ---------------------------------------------------------------------------

CREATE POLICY profiles_select_admin
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY profile_preferences_select_admin
  ON public.profile_preferences FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY quiz_attempts_select_admin
  ON public.quiz_attempts FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY store_products_select_admin
  ON public.store_products FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY store_products_insert_admin
  ON public.store_products FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY store_products_update_admin
  ON public.store_products FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY store_products_delete_admin
  ON public.store_products FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY store_orders_select_admin
  ON public.store_orders FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY store_order_lines_select_admin
  ON public.store_order_lines FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY gstore_orders_select_admin
  ON public.gstore_orders FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY gstore_order_items_select_admin
  ON public.gstore_order_items FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY gstore_payments_select_admin
  ON public.gstore_payments FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY gstore_price_entries_select_admin
  ON public.gstore_price_entries FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY gstore_price_entries_insert_admin
  ON public.gstore_price_entries FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY gstore_price_entries_update_admin
  ON public.gstore_price_entries FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY subscription_plans_select_admin
  ON public.subscription_plans FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY user_subscriptions_select_admin
  ON public.user_subscriptions FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY credit_ledger_entries_select_admin
  ON public.credit_ledger_entries FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY credit_transactions_select_admin
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY billing_payments_select_admin
  ON public.billing_payments FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY billing_invoices_select_admin
  ON public.billing_invoices FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY billing_customers_select_admin
  ON public.billing_customers FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY billing_price_snapshots_select_admin
  ON public.billing_price_snapshots FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY user_entitlements_select_admin
  ON public.user_entitlements FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY membership_credit_grants_select_admin
  ON public.membership_credit_grants FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY payment_audit_log_select_admin
  ON public.payment_audit_log FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY payment_providers_select_admin
  ON public.payment_providers FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY payment_currencies_select_admin
  ON public.payment_currencies FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY shipping_zones_select_admin
  ON public.shipping_zones FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY shipping_zone_methods_select_admin
  ON public.shipping_zone_methods FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY credit_plan_rollover_config_select_admin
  ON public.credit_plan_rollover_config FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY plan_promotions_select_admin
  ON public.plan_promotions FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY mock_testers_select_admin
  ON public.mock_testers FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY library_resource_stats_select_admin
  ON public.library_resource_stats FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY user_library_bookmarks_select_admin
  ON public.user_library_bookmarks FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY user_library_progress_select_admin
  ON public.user_library_progress FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY user_library_likes_select_admin
  ON public.user_library_likes FOR SELECT TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Privileged RPCs
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_write_audit_log(
  _action text,
  _entity_type text,
  _entity_id text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb,
  _outcome text DEFAULT 'success'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actor uuid;
  log_id uuid;
BEGIN
  actor := public.require_admin();
  IF _outcome NOT IN ('success', 'denied', 'failed') THEN
    RAISE EXCEPTION 'invalid audit outcome';
  END IF;
  INSERT INTO public.admin_audit_logs (actor_id, action, entity_type, entity_id, metadata, outcome)
  VALUES (actor, _action, _entity_type, _entity_id, coalesce(_metadata, '{}'::jsonb), _outcome)
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_directory()
RETURNS TABLE (
  id uuid,
  email text,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  country_code text,
  status text,
  age_bracket text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  xp integer,
  level smallint,
  credits integer,
  total_quizzes integer,
  current_streak smallint,
  last_played_date date,
  roles public.app_role[],
  plan_tier text,
  subscription_status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN QUERY
  SELECT
    p.id,
    u.email::text,
    p.username,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.country_code,
    p.status,
    p.age_bracket,
    p.created_at,
    u.last_sign_in_at,
    coalesce(prog.xp, 0),
    coalesce(prog.level, 1::smallint),
    coalesce(prog.credits, 0),
    coalesce(prog.total_quizzes, 0),
    coalesce(prog.current_streak, 0::smallint),
    prog.last_played_date,
    coalesce(
      (SELECT array_agg(ur.role ORDER BY ur.role) FROM public.user_roles ur WHERE ur.user_id = p.id),
      ARRAY[]::public.app_role[]
    ),
    sub.plan_tier,
    sub.status
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.user_progression prog ON prog.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT us.plan_tier, us.status
    FROM public.user_subscriptions us
    WHERE us.user_id = p.id
    ORDER BY
      CASE us.status WHEN 'active' THEN 0 WHEN 'trialing' THEN 1 ELSE 2 END,
      us.updated_at DESC
    LIMIT 1
  ) sub ON true
  ORDER BY p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_profile_status(
  _user_id uuid,
  _status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actor uuid;
BEGIN
  actor := public.require_admin();
  IF _status NOT IN ('active', 'suspended') THEN
    RAISE EXCEPTION 'invalid profile status';
  END IF;
  IF _user_id = actor THEN
    RAISE EXCEPTION 'cannot change your own account status';
  END IF;
  IF public.is_super_admin(_user_id) AND NOT public.is_super_admin(actor) THEN
    RAISE EXCEPTION 'cannot modify a super admin';
  END IF;
  UPDATE public.profiles
  SET status = _status, updated_at = now()
  WHERE id = _user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found';
  END IF;
  INSERT INTO public.admin_audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (actor, 'user.status_changed', 'profile', _user_id::text, jsonb_build_object('status', _status));
  RETURN jsonb_build_object('success', true, 'status', _status);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_profile_fields(
  _user_id uuid,
  _display_name text DEFAULT NULL,
  _bio text DEFAULT NULL,
  _country_code text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actor uuid;
BEGIN
  actor := public.require_admin();
  UPDATE public.profiles
  SET
    display_name = coalesce(_display_name, display_name),
    bio = coalesce(_bio, bio),
    country_code = coalesce(_country_code, country_code),
    updated_at = now()
  WHERE id = _user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found';
  END IF;
  INSERT INTO public.admin_audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    actor,
    'user.profile_updated',
    'profile',
    _user_id::text,
    jsonb_build_object(
      'display_name', _display_name,
      'country_code', _country_code
    )
  );
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  _user_id uuid,
  _role public.app_role,
  _grant boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actor uuid;
  super_count integer;
BEGIN
  actor := public.require_super_admin();
  IF _user_id = actor THEN
    RAISE EXCEPTION 'cannot change your own roles';
  END IF;
  IF _role = 'super_admin' AND _grant = false THEN
    SELECT count(*) INTO super_count FROM public.user_roles WHERE role = 'super_admin';
    IF super_count <= 1 THEN
      RAISE EXCEPTION 'cannot revoke the last super admin';
    END IF;
  END IF;
  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _role)
    ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles
    WHERE user_id = _user_id AND role = _role;
  END IF;
  INSERT INTO public.admin_audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    actor,
    CASE WHEN _grant THEN 'role.granted' ELSE 'role.revoked' END,
    'user_role',
    _user_id::text,
    jsonb_build_object('role', _role, 'grant', _grant)
  );
  RETURN jsonb_build_object('success', true, 'role', _role, 'granted', _grant);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  _user_id uuid,
  _amount integer,
  _reason text,
  _note text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actor uuid;
  entry_id uuid;
  new_balance integer;
  idempotency text;
  v_lot record;
  v_needed integer;
  v_take integer;
  v_allocations jsonb := '[]'::jsonb;
BEGIN
  actor := public.require_admin();
  IF _amount = 0 THEN
    RAISE EXCEPTION 'amount must be non-zero';
  END IF;
  IF _reason IS NULL OR btrim(_reason) = '' THEN
    RAISE EXCEPTION 'reason is required';
  END IF;

  idempotency := 'admin-adjust:' || actor::text || ':' || _user_id::text || ':' || gen_random_uuid()::text;

  IF _amount > 0 THEN
    entry_id := public.append_credit_ledger_entry(
      _user_id,
      _amount,
      'admin_adjustment',
      idempotency,
      'admin_adjustment',
      NULL,
      NULL,
      jsonb_build_object('reason', _reason, 'note', coalesce(_note, ''), 'actor_id', actor),
      now(),
      NULL
    );
  ELSE
    v_needed := abs(_amount);
    PERFORM 1 FROM public.user_progression up WHERE up.user_id = _user_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'user_progression row not found';
    END IF;

    FOR v_lot IN
      SELECT cle.id, cle.remaining_amount, cle.expires_at, cle.created_at
      FROM public.credit_ledger_entries cle
      WHERE cle.user_id = _user_id
        AND cle.amount > 0
        AND cle.remaining_amount IS NOT NULL
        AND cle.remaining_amount > 0
        AND cle.expires_at IS NOT NULL
        AND cle.expires_at > now()
      ORDER BY cle.expires_at ASC, cle.created_at ASC, cle.id ASC
      FOR UPDATE
    LOOP
      EXIT WHEN v_needed <= 0;
      v_take := least(v_lot.remaining_amount, v_needed);
      UPDATE public.credit_ledger_entries cle
      SET remaining_amount = cle.remaining_amount - v_take
      WHERE cle.id = v_lot.id AND cle.remaining_amount >= v_take;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'lot allocation failed';
      END IF;
      v_allocations := v_allocations || jsonb_build_array(jsonb_build_object('lot_id', v_lot.id, 'taken', v_take));
      v_needed := v_needed - v_take;
    END LOOP;

    IF v_needed > 0 THEN
      RAISE EXCEPTION 'insufficient credit balance for deduction';
    END IF;

    INSERT INTO public.credit_ledger_entries (
      user_id, amount, entry_type, idempotency_key, reference_type, metadata,
      expires_at, plan_tier_at_earn, remaining_amount
    ) VALUES (
      _user_id, _amount, 'admin_adjustment', idempotency, 'admin_adjustment',
      jsonb_build_object('reason', _reason, 'note', coalesce(_note, ''), 'actor_id', actor, 'lot_allocations', v_allocations),
      NULL, NULL, NULL
    )
    RETURNING id INTO entry_id;

    PERFORM public.reconcile_user_credits(_user_id);
  END IF;

  SELECT up.credits INTO new_balance FROM public.user_progression up WHERE up.user_id = _user_id;

  INSERT INTO public.admin_audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    actor,
    'credits.adjusted',
    'credit_ledger',
    entry_id::text,
    jsonb_build_object('user_id', _user_id, 'amount', _amount, 'reason', _reason)
  );

  RETURN jsonb_build_object('success', true, 'entry_id', entry_id, 'new_balance', new_balance);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_platform_setting(
  _key text,
  _value jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actor uuid;
BEGIN
  actor := public.require_super_admin();
  IF _key IS NULL OR _key !~ '^[a-z][a-z0-9_]*$' OR _key ~* '(secret|password|token|service_role|apikey|api_key|private_key)' THEN
    RAISE EXCEPTION 'invalid or forbidden setting key';
  END IF;
  INSERT INTO public.platform_settings (key, value, updated_by, updated_at)
  VALUES (_key, _value, actor, now())
  ON CONFLICT (key) DO UPDATE
    SET value = excluded.value, updated_by = actor, updated_at = now();
  INSERT INTO public.admin_audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (actor, 'settings.updated', 'platform_setting', _key, jsonb_build_object('key', _key));
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public.require_admin();

  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'active_users', (SELECT count(*) FROM public.profiles WHERE status = 'active'),
    'suspended_users', (SELECT count(*) FROM public.profiles WHERE status = 'suspended'),
    'dau', (
      SELECT count(DISTINCT user_id) FROM public.quiz_attempts
      WHERE completed_at >= now() - interval '1 day'
    ),
    'mau', (
      SELECT count(DISTINCT user_id) FROM public.quiz_attempts
      WHERE completed_at >= now() - interval '30 days'
    ),
    'new_users_7d', (
      SELECT count(*) FROM public.profiles WHERE created_at >= now() - interval '7 days'
    ),
    'creators', (
      SELECT count(DISTINCT user_id) FROM public.user_roles WHERE role = 'creator'
    ),
    'library_creators', (SELECT count(*) FROM public.library_creators),
    'unverified_library_creators', (
      SELECT count(*) FROM public.library_creators WHERE verified = false
    ),
    'published_quizzes', (SELECT count(*) FROM public.quizzes WHERE is_published),
    'total_quizzes', (SELECT count(*) FROM public.quizzes),
    'question_bank', (SELECT count(*) FROM public.quiz_questions),
    'library_resources', (SELECT count(*) FROM public.library_resources),
    'published_library_resources', (
      SELECT count(*) FROM public.library_resources WHERE status = 'published'
    ),
    'store_products', (SELECT count(*) FROM public.store_products),
    'gstore_orders', (SELECT count(*) FROM public.gstore_orders),
    'gstore_orders_30d', (
      SELECT count(*) FROM public.gstore_orders WHERE created_at >= now() - interval '30 days'
    ),
    'credit_orders', (SELECT count(*) FROM public.store_orders),
    'gstore_revenue_minor_30d', (
      SELECT coalesce(sum(amount_minor), 0) FROM public.gstore_payments
      WHERE status IN ('captured', 'paid', 'success') AND created_at >= now() - interval '30 days'
    ),
    'billing_revenue_minor_30d', (
      SELECT coalesce(sum(charge_amount_minor), 0) FROM public.billing_payments
      WHERE status IN ('captured', 'paid', 'success') AND created_at >= now() - interval '30 days'
    ),
    'credits_issued', (
      SELECT coalesce(sum(amount), 0) FROM public.credit_ledger_entries WHERE amount > 0
    ),
    'credits_redeemed', (
      SELECT coalesce(sum(abs(amount)), 0) FROM public.credit_ledger_entries WHERE amount < 0
    ),
    'open_reports', (
      SELECT count(*) FROM public.content_reports WHERE status IN ('open', 'pending')
    ),
    'open_tickets', (
      SELECT count(*) FROM public.support_tickets WHERE status IN ('open', 'pending')
    ),
    'active_subscriptions', (
      SELECT count(*) FROM public.user_subscriptions WHERE status IN ('active', 'trialing')
    ),
    'billing_payments', (SELECT count(*) FROM public.billing_payments),
    'gstore_payments', (SELECT count(*) FROM public.gstore_payments),
    'reward_claims', (SELECT count(*) FROM public.user_entitlements),
    'quiz_attempts_7d', (
      SELECT count(*) FROM public.quiz_attempts WHERE completed_at >= now() - interval '7 days'
    )
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_growth_series()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN jsonb_build_object(
    'users_by_week', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('week', week, 'count', count) ORDER BY week), '[]'::jsonb)
      FROM (
        SELECT date_trunc('week', created_at)::date AS week, count(*)::int AS count
        FROM public.profiles
        WHERE created_at >= now() - interval '12 weeks'
        GROUP BY 1
      ) s
    ),
    'attempts_by_day', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('day', day, 'count', count) ORDER BY day), '[]'::jsonb)
      FROM (
        SELECT completed_at::date AS day, count(*)::int AS count
        FROM public.quiz_attempts
        WHERE completed_at >= now() - interval '14 days'
        GROUP BY 1
      ) s
    ),
    'gstore_revenue_by_week', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('week', week, 'minor', minor) ORDER BY week), '[]'::jsonb)
      FROM (
        SELECT date_trunc('week', created_at)::date AS week, coalesce(sum(amount_minor), 0)::bigint AS minor
        FROM public.gstore_payments
        WHERE status IN ('captured', 'paid', 'success')
          AND created_at >= now() - interval '12 weeks'
        GROUP BY 1
      ) s
    )
  );
END;
$$;

-- Harden the existing order-status RPC: it previously had no admin check.
CREATE OR REPLACE FUNCTION public.admin_update_gstore_order(
  p_order_id uuid,
  p_order_status text DEFAULT NULL,
  p_tracking_number text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actor uuid;
BEGIN
  actor := public.require_admin();
  IF p_order_status IS NOT NULL THEN
    IF p_order_status NOT IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded') THEN
      RAISE EXCEPTION 'Invalid order status: %', p_order_status USING ERRCODE = 'P0007';
    END IF;
    UPDATE public.gstore_orders
    SET order_status = p_order_status, updated_at = now()
    WHERE id = p_order_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'order not found';
    END IF;
  END IF;
  IF p_tracking_number IS NOT NULL THEN
    UPDATE public.gstore_orders
    SET tracking_number = p_tracking_number, updated_at = now()
    WHERE id = p_order_id;
  END IF;
  INSERT INTO public.admin_audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    actor,
    'gstore.order_updated',
    'gstore_order',
    p_order_id::text,
    jsonb_build_object('order_status', p_order_status, 'tracking_number', p_tracking_number)
  );
  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_write_audit_log(text, text, text, jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_directory() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_profile_status(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_profile_fields(uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_adjust_credits(uuid, integer, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_platform_setting(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_dashboard_metrics() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_growth_series() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_gstore_order(uuid, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_write_audit_log(text, text, text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_directory() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_profile_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_profile_fields(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_platform_setting(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_growth_series() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_gstore_order(uuid, text, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- Realtime (selective)
-- ---------------------------------------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE public.content_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gstore_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_subscriptions;
