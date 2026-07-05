-- ============================================================================
-- P — Per-tenant hero background image on `tenants`
-- ============================================================================
-- Adds a single, purpose-built column so each dealer can set their own hero
-- background image (a real showroom shot / branded key visual) instead of the
-- shared two-car static composition. When null, the storefront keeps rendering
-- the existing default two-car scene — an empty column looks identical to today.
--   hero_image_url : text — absolute/public URL of the hero background image
--                    (nullable). null → default HeroBackgroundCars composition.
--
-- RLS — UNCHANGED: this is a new column on the existing `tenants` table, already
-- governed by the tenants policies (rls_policies + p4_public_read_policies). New
-- columns inherit those policies — NO new policy is required.
--
-- IDEMPOTENT: ADD COLUMN IF NOT EXISTS. Safe to re-run.
--
-- APPLY ORDER (run in the Supabase SQL editor, after all prior migrations):
--   … → p7_car_financing → p8_installment_monthly → THIS FILE.
-- AFTER APPLY: the trailing `notify pgrst, 'reload schema';` refreshes the
--   PostgREST cache; then regenerate the Supabase TS types (UTF-8) — do NOT
--   hand-edit lib/supabase/database.types.ts.
-- ============================================================================

alter table public.tenants
  add column if not exists hero_image_url text;

-- Reload the PostgREST schema cache so the new column is exposed via the API.
notify pgrst, 'reload schema';
