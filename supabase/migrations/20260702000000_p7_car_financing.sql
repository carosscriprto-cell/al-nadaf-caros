-- ============================================================================
-- Phase 7 — Car financing fields on `cars`
-- ============================================================================
-- Adds financing-related columns to public.cars so the data layer can express
-- whether a car can be financed and on what headline terms:
--   is_financeable : boolean NOT NULL DEFAULT true — is this car offered with
--                    financing at all? (default true: financing is opt-out per car)
--   down_payment   : numeric — headline required down payment (nullable)
--   price_monthly  : numeric — monthly instalment price (nullable)
--
-- NOTE on price_monthly: a `price_monthly numeric(10,2)` column ALREADY exists on
-- `cars` (baseline_schema — it currently feeds pricing.monthly). `ADD COLUMN IF
-- NOT EXISTS` is therefore an intentional idempotent NO-OP for that column (it is
-- listed here to match the P7 spec; it does NOT alter the existing type/precision).
--
-- RLS — UNCHANGED: these are columns on the existing `cars` table, already
-- governed by the cars policies (rls_policies + p4_public_read_policies). New
-- columns inherit those policies — NO new policy is required.
--
-- IDEMPOTENT: ADD COLUMN IF NOT EXISTS on every column. Safe to re-run.
--
-- APPLY ORDER (run in the Supabase SQL editor, after all prior migrations):
--   … → e1e3_car_brands → e4_car_content_per_locale → THIS FILE.
-- AFTER APPLY: the trailing `notify pgrst, 'reload schema';` refreshes the
--   PostgREST cache; then regenerate the Supabase TS types (UTF-8) — do NOT
--   hand-edit lib/supabase/database.types.ts.
-- ============================================================================

alter table public.cars
  add column if not exists is_financeable boolean not null default true;

alter table public.cars
  add column if not exists down_payment numeric;

-- Idempotent no-op if it already exists (baseline already has price_monthly).
alter table public.cars
  add column if not exists price_monthly numeric;

-- Reload the PostgREST schema cache so the new columns are exposed via the API.
notify pgrst, 'reload schema';
