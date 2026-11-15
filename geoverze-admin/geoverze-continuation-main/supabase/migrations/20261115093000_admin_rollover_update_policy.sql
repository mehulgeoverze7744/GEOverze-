-- Allow administrators to update credit plan rollover windows.
-- Additive only: existing SELECT policy and table data are preserved.

CREATE POLICY credit_plan_rollover_config_update_admin
  ON public.credit_plan_rollover_config FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
