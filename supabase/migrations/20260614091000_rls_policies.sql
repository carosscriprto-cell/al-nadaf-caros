-- ============================================================================
-- Phase 2 · Task 5 — Row-Level Security policies (version-controlled)
-- ============================================================================
-- These mirror the EXISTING live policies (verified via pg_policies on
-- 2026-06-14). Purpose: version-control RLS so the schema is recreatable from
-- scratch. Idempotent (DROP ... IF EXISTS before CREATE).
--
-- ⚠️ The live DB already has these policies — do NOT re-run this there unless you
--    intend to rebuild them. This file is for fresh-environment recreation and
--    as the source-of-truth record.
--
-- DEPENDS ON: function public.my_tenant_id() and the tenant-scoped tables, which
-- come from the baseline schema migration (Task 3). Apply this AFTER the baseline.
--
-- Isolation model: every tenant-scoped row is gated by my_tenant_id() (directly,
-- or via the parent car for car_content). Role escalation enforced via
-- tenant_users.role. UPDATE policies intentionally omit WITH CHECK — Postgres
-- applies the USING expression as the new-row check, so rows can't move tenants.
--
-- KNOWN FLAGS (documented, not changed here):
--   * leads "insert public" uses WITH CHECK (true) — public lead capture; allows
--     arbitrary tenant_id. Tighten in a later phase.
--   * No policy for: tenants INSERT/DELETE, tenant_users UPDATE, leads DELETE
--     (service-role only by design — confirm intent).
-- ============================================================================

-- ── Enable RLS on all tenant-scoped tables ──────────────────────────────────
alter table public.tenants      enable row level security;
alter table public.tenant_users enable row level security;
alter table public.cars         enable row level security;
alter table public.car_content  enable row level security;
alter table public.tenant_pages enable row level security;
alter table public.leads        enable row level security;

-- ── tenants ─────────────────────────────────────────────────────────────────
drop policy if exists "tenant: select own" on public.tenants;
create policy "tenant: select own"
  on public.tenants for select to public
  using (id = my_tenant_id());

drop policy if exists "tenant: update own (owner only)" on public.tenants;
create policy "tenant: update own (owner only)"
  on public.tenants for update to public
  using (
    (id = my_tenant_id())
    and exists (
      select 1 from tenant_users
      where tenant_users.user_id = auth.uid()
        and tenant_users.tenant_id = tenants.id
        and tenant_users.role = 'owner'::user_role
    )
  );

-- ── tenant_users ────────────────────────────────────────────────────────────
drop policy if exists "tenant_users: select own tenant" on public.tenant_users;
create policy "tenant_users: select own tenant"
  on public.tenant_users for select to public
  using (tenant_id = my_tenant_id());

drop policy if exists "tenant_users: insert (owner only)" on public.tenant_users;
create policy "tenant_users: insert (owner only)"
  on public.tenant_users for insert to public
  with check (
    (tenant_id = my_tenant_id())
    and exists (
      select 1 from tenant_users tu
      where tu.user_id = auth.uid()
        and tu.tenant_id = tenant_users.tenant_id
        and tu.role = 'owner'::user_role
    )
  );

drop policy if exists "tenant_users: delete (owner only)" on public.tenant_users;
create policy "tenant_users: delete (owner only)"
  on public.tenant_users for delete to public
  using (
    (tenant_id = my_tenant_id())
    and exists (
      select 1 from tenant_users tu
      where tu.user_id = auth.uid()
        and tu.tenant_id = tenant_users.tenant_id
        and tu.role = 'owner'::user_role
    )
  );

-- ── cars ────────────────────────────────────────────────────────────────────
drop policy if exists "cars: select own tenant" on public.cars;
create policy "cars: select own tenant"
  on public.cars for select to public
  using (tenant_id = my_tenant_id());

drop policy if exists "cars: insert (editor+)" on public.cars;
create policy "cars: insert (editor+)"
  on public.cars for insert to public
  with check (tenant_id = my_tenant_id());

drop policy if exists "cars: update (editor+)" on public.cars;
create policy "cars: update (editor+)"
  on public.cars for update to public
  using (tenant_id = my_tenant_id());

drop policy if exists "cars: delete (admin+)" on public.cars;
create policy "cars: delete (admin+)"
  on public.cars for delete to public
  using (
    (tenant_id = my_tenant_id())
    and exists (
      select 1 from tenant_users
      where tenant_users.user_id = auth.uid()
        and tenant_users.tenant_id = cars.tenant_id
        and tenant_users.role = any (array['admin'::user_role, 'owner'::user_role])
    )
  );

-- ── car_content (isolated via parent car) ───────────────────────────────────
drop policy if exists "car_content: select own tenant" on public.car_content;
create policy "car_content: select own tenant"
  on public.car_content for select to public
  using (
    exists (
      select 1 from cars
      where cars.id = car_content.car_id
        and cars.tenant_id = my_tenant_id()
    )
  );

drop policy if exists "car_content: insert own tenant" on public.car_content;
create policy "car_content: insert own tenant"
  on public.car_content for insert to public
  with check (
    exists (
      select 1 from cars
      where cars.id = car_content.car_id
        and cars.tenant_id = my_tenant_id()
    )
  );

drop policy if exists "car_content: update own tenant" on public.car_content;
create policy "car_content: update own tenant"
  on public.car_content for update to public
  using (
    exists (
      select 1 from cars
      where cars.id = car_content.car_id
        and cars.tenant_id = my_tenant_id()
    )
  );

drop policy if exists "car_content: delete own tenant" on public.car_content;
create policy "car_content: delete own tenant"
  on public.car_content for delete to public
  using (
    exists (
      select 1 from cars
      where cars.id = car_content.car_id
        and cars.tenant_id = my_tenant_id()
    )
  );

-- ── tenant_pages ────────────────────────────────────────────────────────────
drop policy if exists "tenant_pages: select own" on public.tenant_pages;
create policy "tenant_pages: select own"
  on public.tenant_pages for select to public
  using (tenant_id = my_tenant_id());

drop policy if exists "tenant_pages: insert own" on public.tenant_pages;
create policy "tenant_pages: insert own"
  on public.tenant_pages for insert to public
  with check (tenant_id = my_tenant_id());

drop policy if exists "tenant_pages: update own" on public.tenant_pages;
create policy "tenant_pages: update own"
  on public.tenant_pages for update to public
  using (tenant_id = my_tenant_id());

drop policy if exists "tenant_pages: delete (admin+)" on public.tenant_pages;
create policy "tenant_pages: delete (admin+)"
  on public.tenant_pages for delete to public
  using (
    (tenant_id = my_tenant_id())
    and exists (
      select 1 from tenant_users
      where tenant_users.user_id = auth.uid()
        and tenant_users.tenant_id = tenant_pages.tenant_id
        and tenant_users.role = any (array['admin'::user_role, 'owner'::user_role])
    )
  );

-- ── leads ───────────────────────────────────────────────────────────────────
drop policy if exists "leads: select own tenant" on public.leads;
create policy "leads: select own tenant"
  on public.leads for select to public
  using (tenant_id = my_tenant_id());

-- NOTE: public lead capture — WITH CHECK (true) permits any tenant_id. Flagged.
drop policy if exists "leads: insert public" on public.leads;
create policy "leads: insert public"
  on public.leads for insert to public
  with check (true);

drop policy if exists "leads: update own tenant" on public.leads;
create policy "leads: update own tenant"
  on public.leads for update to public
  using (tenant_id = my_tenant_id());
