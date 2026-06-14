-- ============================================================================
-- Phase 2 · my_tenant_id() hardening — core of all tenant isolation
-- ============================================================================
-- 1) SECURITY: pin search_path to '' on this SECURITY DEFINER function. An
--    unpinned search_path on a SECURITY DEFINER function is a known Postgres
--    privilege-escalation vector (Supabase's linter flags it). With search_path
--    pinned to '', every object reference must be schema-qualified — hence
--    public.tenant_users and auth.uid().
--
-- ⚠️ This CREATE OR REPLACE reconstructs the body as described/verified:
--      select tenant_id from tenant_users where user_id = auth.uid() limit 1
--    Diff against `select pg_get_functiondef('public.my_tenant_id'::regproc)`
--    before applying — if the original has extra logic, port it in here.
--
-- 2) CORRECTNESS — KNOWN LIMITATION (documented, intentionally NOT fixed here):
--    `limit 1` with no `order by` returns an ARBITRARY tenant when a user belongs
--    to more than one tenant. Safe while every user maps to exactly one tenant,
--    but a silent isolation break the moment multi-tenant membership exists
--    (e.g. an owner managing two dealerships). The real fix is an explicit
--    active-tenant context (e.g. a JWT claim or session GUC), NOT `limit 1`.
--    Revisit when onboarding allows multi-tenant users.
-- ============================================================================

create or replace function public.my_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select tenant_id
  from public.tenant_users
  where user_id = auth.uid()
  limit 1
$$;
