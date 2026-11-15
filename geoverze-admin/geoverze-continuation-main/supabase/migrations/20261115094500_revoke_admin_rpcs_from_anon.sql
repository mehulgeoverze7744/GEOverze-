-- Admin RPCs still enforce require_admin()/require_super_admin() internally.
-- Revoke default PUBLIC/anon execute so unauthenticated callers cannot even invoke them.

REVOKE EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_dashboard_metrics() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_growth_series() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_directory() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_platform_setting(text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_profile_status(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_profile_fields(uuid, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_write_audit_log(text, text, text, jsonb, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_gstore_order(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.require_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.require_super_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_growth_series() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_directory() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_platform_setting(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_profile_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_profile_fields(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_write_audit_log(text, text, text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_gstore_order(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.require_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.require_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
