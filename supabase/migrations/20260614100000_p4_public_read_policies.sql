-- ============================================================================
-- Phase 4 · Public storefront read access for the `anon` role
-- ============================================================================
-- The public storefront renders one tenant's PUBLIC listings, resolved from the
-- request host (middleware → x-tenant-id → .eq('tenant_id', resolvedId)). These
-- tables hold inherently public data (vehicle catalog + tenant branding/SEO), so
-- the anon role may SELECT rows that belong to ACTIVE tenants.
--
-- SECURITY MODEL:
--   * These policies are scoped `TO anon` ONLY. Authenticated users keep their
--     existing `my_tenant_id()` policies (rls_policies.sql), so cross-tenant
--     isolation for logged-in dashboard users is UNCHANGED.
--   * The `.eq('tenant_id', …)` in queries is a "which dealer" SELECTOR, not the
--     security boundary. The boundaries remain:
--       - WRITES gated by my_tenant_id() (anon has none → rejected).
--       - leads (PII) has NO anon read policy — anon cannot read leads.
--       - INACTIVE tenants are invisible to the public.
--   * Permissive SELECT policies combine with OR, so adding these does not
--     widen authenticated access.
--
-- Idempotent (drop-if-exists before create). Safe to re-run.
-- ============================================================================

-- ── tenants: anon reads ACTIVE tenant branding/SEO/contact (for theming + SEO) ──
drop policy if exists "tenants: public read active" on public.tenants;
create policy "tenants: public read active"
  on public.tenants for select to anon
  using (active = true);

-- ── cars: anon reads cars belonging to ACTIVE tenants ───────────────────────────
drop policy if exists "cars: public read active tenant" on public.cars;
create policy "cars: public read active tenant"
  on public.cars for select to anon
  using (
    exists (
      select 1 from public.tenants t
      where t.id = cars.tenant_id and t.active = true
    )
  );

-- ── car_content: anon reads content whose parent car is an ACTIVE tenant's ──────
drop policy if exists "car_content: public read active tenant" on public.car_content;
create policy "car_content: public read active tenant"
  on public.car_content for select to anon
  using (
    exists (
      select 1
      from public.cars c
      join public.tenants t on t.id = c.tenant_id
      where c.id = car_content.car_id and t.active = true
    )
  );
