-- ============================================================================
-- P — Theme-aware dark logo variant on `tenants`
-- ============================================================================
-- Adds a second logo column for the DARK-optimized logo shown on LIGHT
-- backgrounds. Naming is intentional and asymmetric:
--   logo_url      : the existing light/WHITE logo — shown on the DARK theme.
--   logo_dark_url : NEW — the dark logo for LIGHT backgrounds — shown on the
--                   LIGHT theme. Nullable; when null the storefront falls back
--                   to logo_url so a logo always renders.
--
-- RLS — UNCHANGED: new column on the existing `tenants` table, already governed
-- by the tenants policies (rls_policies + p4_public_read_policies). New columns
-- inherit those policies — NO new policy is required.
--
-- IDEMPOTENT: ADD COLUMN IF NOT EXISTS. Safe to re-run.
--
-- APPLY ORDER (run in the Supabase SQL editor, after all prior migrations):
--   … → p_hero_image → p_footer_tagline → THIS FILE.
-- AFTER APPLY: the trailing `notify pgrst, 'reload schema';` refreshes the
--   PostgREST cache; then regenerate the Supabase TS types (UTF-8) — do NOT
--   hand-edit lib/supabase/database.types.ts.
-- ============================================================================

alter table public.tenants
  add column if not exists logo_dark_url text;

-- Reload the PostgREST schema cache so the new column is exposed via the API.
notify pgrst, 'reload schema';
