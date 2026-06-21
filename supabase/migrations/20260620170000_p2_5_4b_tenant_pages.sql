-- ============================================================================
-- Phase 2.5-4b-1 — Site management: per-tenant page/button toggles
-- ============================================================================
-- Adds a per-tenant `pages` jsonb to `tenants`: the show/hide config for optional
-- storefront pages and lead-capture buttons, edited in the new Site tab and read
-- by the storefront (parseTenantPages applies graceful defaults).
--
-- Shape (all optional; missing → default TRUE):
--   {
--     "about": true,            -- the /about page + its nav link
--     "leadAvailability": true, -- the "Check availability" capture button on cars
--     "leadViewing": true       -- the "Book a viewing" capture button on cars
--   }
-- NULL / missing keys → all on (existing tenants need no backfill).
--
-- No new RLS: `pages` is just another column on the existing tenants row.
-- Reads use "tenant: select own" / "tenants: public read active"; writes use the
-- owner-only "tenant: update own (owner only)" policy.
--
-- APPLY: review, then run in the Supabase SQL editor. Idempotent.
-- ============================================================================

alter table public.tenants
  add column if not exists pages jsonb;
