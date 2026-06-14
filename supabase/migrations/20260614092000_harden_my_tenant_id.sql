-- ============================================================================
-- Phase 2 · Harden tenant-resolver functions — core of tenant isolation (RLS)
--           and P4 tenant resolution (domain/slug → tenant_id)
-- ============================================================================
-- All three are SECURITY DEFINER. A SECURITY DEFINER function WITHOUT a pinned
-- search_path is a known Postgres privilege-escalation vector (Supabase's linter
-- flags it). Fix: SET search_path = '' on each + schema-qualify every reference
-- (public.tenant_users, public.tenants, auth.uid()).
--
-- Bodies are byte-for-byte the live/baseline logic — only the search_path pin and
-- schema-qualification are added. No behavioral change.
--
-- ⚠️ KNOWN LIMITATION (my_tenant_id, documented — NOT fixed here):
--    `limit 1` with no `order by` returns an ARBITRARY tenant when a user belongs
--    to more than one tenant. Safe while every user maps to exactly one tenant; a
--    silent isolation break once multi-tenant membership exists. Real fix is an
--    explicit active-tenant context (JWT claim / session GUC), not `limit 1`.
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

create or replace function public.get_tenant_id_by_domain(p_domain text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.tenants
  where (domain = p_domain or subdomain = p_domain)
    and active = true
  limit 1
$$;

create or replace function public.get_tenant_id_by_slug(p_slug text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.tenants
  where slug = p_slug
    and active = true
  limit 1
$$;
