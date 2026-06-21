-- ============================================================================
-- Phase 2.5-4b-2 — Per-tenant editable section content
-- ============================================================================
-- Adds a per-tenant `content` jsonb to `tenants`: bilingual text overrides for
-- the otherwise-static home/about sections (whyChooseUs, howItWorks, about),
-- edited in the Site tab and read by the storefront. parseTenantContent applies
-- graceful fallbacks — any missing/empty field falls back to the static i18n
-- default, so existing tenants and blank fields keep the current copy.
--
-- Shape (every field optional; en + ar):
--   {
--     "whyChooseUs": { "en": { "title", "description", "items": [{ "title","text" }] }, "ar": {…} },
--     "howItWorks":  { "en": { "title", "description", "items": [{ "title","text" }] }, "ar": {…} },
--     "about":       { "en": { "heading", "body" }, "ar": {…} }
--   }
-- NULL / missing → static i18n defaults (existing tenants need no backfill).
--
-- No new RLS: `content` is just another column on the existing tenants row.
-- Reads use "tenant: select own" / "tenants: public read active"; writes use the
-- owner-only "tenant: update own (owner only)" policy.
--
-- APPLY: review, then run in the Supabase SQL editor. Idempotent.
-- ============================================================================

alter table public.tenants
  add column if not exists content jsonb;
