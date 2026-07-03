-- ============================================================================
-- Phase 8 — Dedicated monthly-installment column on `cars`
-- ============================================================================
-- Adds a single, purpose-built column for the financing monthly instalment so it
-- no longer has to piggy-back on `price_monthly` (which is the RENTAL monthly
-- price). Keeping the two concepts on separate columns removes the value drift
-- between rental pricing and financing figures.
--   installment_monthly : numeric — headline monthly financing instalment
--                         (nullable). pricing.monthly stays = rental monthly.
--
-- RLS — UNCHANGED: this is a new column on the existing `cars` table, already
-- governed by the cars policies (rls_policies + p4_public_read_policies). New
-- columns inherit those policies — NO new policy is required.
--
-- IDEMPOTENT: ADD COLUMN IF NOT EXISTS. Safe to re-run.
--
-- APPLY ORDER (run in the Supabase SQL editor, after all prior migrations):
--   … → e4_car_content_per_locale → p7_car_financing → THIS FILE.
-- AFTER APPLY: the trailing `notify pgrst, 'reload schema';` refreshes the
--   PostgREST cache; then regenerate the Supabase TS types (UTF-8) — do NOT
--   hand-edit lib/supabase/database.types.ts.
-- ============================================================================

alter table public.cars
  add column if not exists installment_monthly numeric;

-- Reload the PostgREST schema cache so the new column is exposed via the API.
notify pgrst, 'reload schema';
