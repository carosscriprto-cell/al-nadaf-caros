-- ============================================================================
-- Phase 6 — White-label storefront sections
-- ============================================================================
-- Adds a per-tenant `sections` jsonb to `tenants`: the ordered show/hide config
-- for the storefront home sections (hero, brandShowcase, featuredCars, …). The
-- storefront reads it via getTenantConfig(); the owner edits it in Settings.
--
-- Shape (array, in render order):
--   [{ "key": "hero", "enabled": true }, { "key": "brandShowcase", "enabled": false }, …]
-- NULL / missing → the app falls back to DEFAULT_SECTIONS (all on, canonical order),
-- so existing tenants need no backfill. parseSections() also tolerates a bare
-- ["hero","featuredCars"] array of keys.
--
-- No new RLS: `sections` is just another column on the existing tenants row.
-- Reads are covered by "tenants: select own" / "tenants: public read active";
-- writes by the owner-only "tenant: update own (owner only)" policy.
--
-- APPLY: review, then run in the Supabase SQL editor. Idempotent.
-- ============================================================================

alter table public.tenants
  add column if not exists sections jsonb;
