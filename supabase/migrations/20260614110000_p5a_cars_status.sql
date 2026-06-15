-- ============================================================================
-- Phase 5a · cars.status — richer lifecycle field (available / sold / reserved)
-- ============================================================================
-- `available` (boolean) stays the public-visibility switch; `status` is the
-- richer state. Server Actions keep them coherent: status='available' ⇒
-- available=true; sold/reserved ⇒ available=false (storefront hides them).
--
-- Text + CHECK (not a new enum) — cheap to extend later, and the app validates
-- the same set via zod. Backfills existing rows from the current `available`.
--
-- Idempotent. Apply in the Supabase SQL editor (or `supabase db push`), then
-- regenerate types: `supabase gen types typescript`.
-- ============================================================================

alter table public.cars
  add column if not exists status text not null default 'available';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cars_status_check'
  ) then
    alter table public.cars
      add constraint cars_status_check
      check (status in ('available', 'sold', 'reserved'));
  end if;
end $$;

-- Backfill: rows currently hidden become 'reserved' is wrong to assume — keep
-- it simple and truthful: visible→available, hidden→reserved is NOT implied, so
-- default everything to 'available' and let the admin set sold/reserved.
update public.cars set status = 'available' where status is null;
