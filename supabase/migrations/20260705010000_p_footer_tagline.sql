-- ============================================================================
-- P — Per-tenant, bilingual footer tagline on `tenants`
-- ============================================================================
-- Adds two purpose-built columns so each dealer can set their own footer brand
-- blurb (the short description in the footer brand card) per locale, editable
-- from the dashboard settings. When null, the footer keeps rendering the shared
-- i18n `footer.company` copy — an empty column looks identical to today.
--   footer_tagline_en : text — footer brand blurb (English). null → i18n default.
--   footer_tagline_ar : text — footer brand blurb (Arabic). null → i18n default.
--
-- RLS — UNCHANGED: new columns on the existing `tenants` table, already governed
-- by the tenants policies (rls_policies + p4_public_read_policies). New columns
-- inherit those policies — NO new policy is required.
--
-- IDEMPOTENT: ADD COLUMN IF NOT EXISTS. Safe to re-run.
--
-- APPLY ORDER (run in the Supabase SQL editor, after all prior migrations):
--   … → p8_installment_monthly → p_hero_image → THIS FILE.
-- AFTER APPLY: the trailing `notify pgrst, 'reload schema';` refreshes the
--   PostgREST cache; then regenerate the Supabase TS types (UTF-8) — do NOT
--   hand-edit lib/supabase/database.types.ts.
-- ============================================================================

alter table public.tenants
  add column if not exists footer_tagline_en text;

alter table public.tenants
  add column if not exists footer_tagline_ar text;

-- Reload the PostgREST schema cache so the new columns are exposed via the API.
notify pgrst, 'reload schema';
