-- ============================================================================
-- Phase 5b — Leads / Bookings persistence
-- ============================================================================
-- The `leads` table (baseline schema) is the SINGLE lead/booking store — this
-- project unifies on one source (see P3). Rather than add a parallel `bookings`
-- table, we extend `leads` to carry booking intent (type + rental window +
-- pickup location). One table → one RLS surface → one dashboard read.
--
-- WHAT THIS ADDS
--   * leads.type            'inquiry' | 'booking' | 'purchase'  (default inquiry)
--   * leads.rental_start    pickup date  (rental bookings only; nullable)
--   * leads.rental_end      return date  (rental bookings only; nullable)
--   * leads.pickup_location free-text pickup location (nullable)
--   * CHECK constraints pinning type ∈ {inquiry,booking,purchase} and
--     status ∈ {new,contacted,closed}
--   * idx_leads_tenant_status — dashboard status filter
--   * Tightened anon INSERT policy: a public lead may only target an ACTIVE
--     tenant (was WITH CHECK (true), flagged in rls_policies.sql).
--
-- SECURITY MODEL (unchanged intent, now enforced):
--   * anon (public storefront) CAN INSERT a lead, but ONLY for an active tenant.
--   * anon CANNOT SELECT leads — there is no anon read policy (PII protected).
--   * authenticated dealer reads/updates ONLY own-tenant leads (my_tenant_id()).
--
-- APPLY: review, then run in the Supabase SQL editor (no db push / Docker).
-- Idempotent (IF EXISTS / IF NOT EXISTS, drop-before-create on the policy).
-- ============================================================================

-- ── Columns ─────────────────────────────────────────────────────────────────
alter table public.leads
  add column if not exists type            text not null default 'inquiry',
  add column if not exists rental_start    date,
  add column if not exists rental_end      date,
  add column if not exists pickup_location text;

-- ── Normalize any pre-existing NULL/legacy status before constraining ────────
update public.leads set status = 'new' where status is null;

-- ── CHECK constraints (drop-before-add so re-runs are clean) ─────────────────
alter table public.leads drop constraint if exists leads_type_check;
alter table public.leads
  add constraint leads_type_check check (type in ('inquiry', 'booking', 'purchase'));

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads
  add constraint leads_status_check check (status in ('new', 'contacted', 'closed'));

-- ── Index: dashboard filters/sorts by status within a tenant ─────────────────
create index if not exists idx_leads_tenant_status on public.leads (tenant_id, status);

-- ── Tighten public INSERT: only ACTIVE tenants may receive public leads ──────
-- Mirrors the cars/car_content public-read pattern (EXISTS over active tenants,
-- which anon can see via "tenants: public read active"). Prevents the arbitrary
-- / garbage tenant_id injection that WITH CHECK (true) previously allowed.
--
-- IMPORTANT for callers: anon has NO select policy on leads (PII), so a public
-- INSERT must NOT use RETURNING — `insert(...).select()` issues INSERT … RETURNING
-- and the read-back is denied (42501), rolling the row back. The storefront
-- submit inserts WITHOUT .select() (see lib/leads/submit.ts).
drop policy if exists "leads: insert public" on public.leads;

-- Drop a SECURITY DEFINER helper from an earlier draft of this migration, if it
-- was applied — the bare EXISTS below works (the 42501 was the RETURNING read,
-- not the WITH CHECK), so the function is unnecessary. No-op if absent.
drop function if exists public.tenant_is_active(uuid);

create policy "leads: insert public"
  on public.leads for insert to public
  with check (
    exists (
      select 1 from public.tenants t
      where t.id = leads.tenant_id and t.active = true
    )
  );

-- NOTE: "leads: select own tenant" and "leads: update own tenant" (rls_policies.sql)
-- are unchanged — dealer reads/updates stay scoped to my_tenant_id(). No anon
-- read policy exists, so anon still cannot read leads.
