-- ============================================================================
-- E4 — Make 5 car fields bilingual (per-locale) instead of single-value
-- ============================================================================
-- GOAL
--   Five fields that were single-value columns on `cars` and rendered only in
--   the language they were entered in (Arabic, even on /en) become PER-LOCALE,
--   stored in `car_content` (which already holds title/description/features per
--   locale, one row per (car_id, locale)):
--
--       address          → text   (nullable)
--       city             → text   (nullable)
--       color            → text   (nullable)
--       interior_color   → text   (nullable)
--       pickup_locations → text[] (nullable)
--
--   `country` stays SINGLE on `cars` (out of scope — controlled-list later).
--
-- BACKWARD COMPATIBLE (nothing dropped):
--   The legacy cars.{address,city,color,interior_color,pickup_locations} columns
--   are KEPT and stay readable during the transition. cars.city / cars.country are
--   NOT NULL, so the app keeps writing them as a denormalized AR mirror (sourced
--   from the AR content value) — legacy readers + the car mapper still work. The
--   storefront now reads the per-locale car_content values (AR→EN fallback) and
--   only uses the cars.* columns as an ultimate safety fallback.
--
-- DATA MIGRATION (backfill):
--   For each existing car, copy the current cars.{...} value into the AR
--   car_content row (locale='ar') ONLY. The EN row's new fields stay NULL so the
--   storefront falls back to AR until the dealer translates (same behavior as
--   description). Idempotent: only fills AR rows whose 5 new fields are all still
--   NULL, so re-running never overwrites a dealer's later edits. Reports the count
--   via RAISE NOTICE.
--
-- RLS — UNCHANGED:
--   These are columns on the EXISTING car_content table, which is already governed
--   row-by-row via its parent car (rls_policies + p4_public_read_policies). New
--   columns inherit those policies — NO new policy is required.
--
-- IDEMPOTENT: ADD COLUMN IF NOT EXISTS, guarded backfill, COMMENT is repeatable.
--   Safe to re-run.
--
-- APPLY ORDER (run in the Supabase SQL editor, after all prior migrations):
--   baseline_schema → extend_market_enums → harden_my_tenant_id → rls_policies
--   → p4_public_read_policies → … → e1e3_car_brands → THIS FILE.
-- AFTER APPLY: `notify pgrst, 'reload schema';` (included) then regenerate the
--   Supabase TS types (UTF-8).
-- ============================================================================

-- ── 1. Per-locale columns on car_content (nullable) ─────────────────────────
alter table public.car_content
  add column if not exists address          text,
  add column if not exists city             text,
  add column if not exists color            text,
  add column if not exists interior_color   text,
  add column if not exists pickup_locations text[];

-- ── 2. Backfill: copy cars.* → AR car_content row only (idempotent) ─────────
-- Only fills AR rows whose 5 new fields are ALL still NULL (never re-touches a
-- row a dealer has since edited) and where the car actually has a source value.
do $$
declare
  v_count integer;
begin
  update public.car_content cc
  set address          = coalesce(cc.address,          c.address),
      city             = coalesce(cc.city,             c.city),
      color            = coalesce(cc.color,            c.color),
      interior_color   = coalesce(cc.interior_color,   c.interior_color),
      pickup_locations = coalesce(cc.pickup_locations, c.pickup_locations)
  from public.cars c
  where cc.car_id = c.id
    and cc.locale = 'ar'
    and cc.address is null
    and cc.city is null
    and cc.color is null
    and cc.interior_color is null
    and cc.pickup_locations is null
    and (c.address is not null
      or c.city is not null
      or c.color is not null
      or c.interior_color is not null
      or c.pickup_locations is not null);
  get diagnostics v_count = row_count;
  raise notice 'E4 backfill: % AR car_content row(s) populated from cars.*', v_count;
end$$;

-- ── 3. Mark the legacy cars.* columns deprecated for DISPLAY (kept, not dropped)
comment on column public.cars.address is
  'DEPRECATED for display (E4): per-locale value now lives in car_content.address. Kept as a denormalized AR mirror for backward-compatible reads.';
comment on column public.cars.city is
  'DEPRECATED for display (E4): per-locale value now lives in car_content.city. Kept NOT NULL as a denormalized AR mirror for backward-compatible reads.';
comment on column public.cars.color is
  'DEPRECATED for display (E4): per-locale value now lives in car_content.color. Kept as a denormalized AR mirror for backward-compatible reads.';
comment on column public.cars.interior_color is
  'DEPRECATED for display (E4): per-locale value now lives in car_content.interior_color. Kept as a denormalized AR mirror for backward-compatible reads.';
comment on column public.cars.pickup_locations is
  'DEPRECATED for display (E4): per-locale value now lives in car_content.pickup_locations. Kept as a denormalized AR mirror for backward-compatible reads.';
-- NOTE: cars.country is intentionally NOT deprecated — it stays SINGLE (E4 scope).

-- ── 4. Reload PostgREST schema cache so the new columns are exposed ──────────
notify pgrst, 'reload schema';

-- ============================================================================
-- REPORT QUERY — run AFTER apply to verify the backfill (read-only):
--
--   select cc.locale, count(*) filter (where cc.city is not null) as with_city,
--          count(*) as rows
--   from public.car_content cc group by cc.locale order by cc.locale;
-- ============================================================================
