-- ============================================================================
-- Phase 5a · Rental terms — mileage_limit + insurance on cars
-- ============================================================================
-- Rental-specific terms that should be queryable/displayable (not folded into
-- free-text arrays):
--   mileage_limit : integer — included km per day (NULL = unlimited)
--   insurance     : text    — insurance terms shown to renters
--                             (e.g. 'Comprehensive included', 'Third-party')
-- Both nullable; only relevant to rent/both listings.
--
-- Idempotent. Apply in the Supabase SQL editor (or `supabase db push`), then
-- regenerate types: `supabase gen types typescript`.
-- ============================================================================

alter table public.cars add column if not exists mileage_limit integer;
alter table public.cars add column if not exists insurance text;
