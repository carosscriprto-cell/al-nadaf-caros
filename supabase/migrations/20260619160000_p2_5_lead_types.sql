-- ============================================================================
-- Phase 2.5-2 — Lead capture: extend lead types
-- ============================================================================
-- The smart capture buttons on car cards/detail file typed leads. Extend the
-- leads_type_check constraint with two new intents:
--   * availability — "is this car available?" (sale + rental)
--   * viewing      — "I'd like to view this car" (sale)
-- Existing values (inquiry, booking, purchase) are unchanged.
--
-- `leads.type` is a plain text column with a CHECK (not a pg enum), so this is a
-- constraint swap only — no type/enum migration, no data backfill.
--
-- APPLY: review, then run in the Supabase SQL editor. Idempotent.
-- ============================================================================

alter table public.leads drop constraint if exists leads_type_check;
alter table public.leads
  add constraint leads_type_check
  check (type in ('inquiry', 'booking', 'purchase', 'availability', 'viewing'));
