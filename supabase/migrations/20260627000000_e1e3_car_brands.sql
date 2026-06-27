-- ============================================================================
-- E1 + E3 — Controlled car-brands reference list + CDN logo resolution
-- ============================================================================
-- GOAL
--   * Introduce public.car_brands — GLOBAL reference data (NOT tenant-scoped).
--     slug is the source of truth (e.g. 'bmw'); logo_url is an OPTIONAL manual
--     override only (logos are otherwise derived from the slug at render time via
--     a free, no-key CDN — see lib/tenant/brandLogo.ts; NO storage, NO API keys).
--   * Link cars to a brand via a NULLABLE cars.brand_slug text column with an FK
--     to car_brands(slug). The legacy free-text cars.brand column is KEPT and
--     stays readable during/after transition (backward compatible).
--   * Normalize existing free-text cars.brand values → car_brands.slug and link
--     them. Unmatched rows keep their original cars.brand and have brand_slug NULL
--     (nothing is dropped). A diagnostic report query is at the bottom.
--
-- WHY brand_slug text (NOT brand_id uuid) — lower migration risk:
--   * The existing cars.brand text column is untouched, so no row is rewritten to
--     a non-null FK on apply (a uuid FK would force a backfill + risk null FKs on
--     unmatched rows breaking a NOT NULL assumption). brand_slug is nullable: an
--     unmatched legacy brand simply has NULL brand_slug and keeps its readable
--     brand text. slug is also the documented source of truth, so a text FK to it
--     is the natural, human-readable link and survives a future regen cleanly.
--
-- RLS MODEL (car_brands is GLOBAL):
--   * SELECT: TO public (anon + authenticated) USING (true) — storefront brand
--     showcase + dashboard select both read it; it is inherently public catalog.
--   * INSERT/UPDATE/DELETE: authenticated owner/admin of ANY tenant only
--     (a dealer may add a missing brand). anon cannot write.
--
-- IDEMPOTENT: IF NOT EXISTS on table/column/index, DROP-before-CREATE on policies,
--   ON CONFLICT DO NOTHING on the seed, DO-block guard on the FK. Safe to re-run.
--
-- APPLY ORDER (run in the Supabase SQL editor, after all prior migrations):
--   baseline_schema → extend_market_enums → harden_my_tenant_id → rls_policies
--   → p4_public_read_policies → … → qa2b_lead_whatsapp_flag → THIS FILE.
-- AFTER APPLY: `notify pgrst, 'reload schema';` (included) then regenerate the
--   Supabase TS types (UTF-8).
-- ============================================================================

-- ── 1. car_brands table (GLOBAL reference data) ─────────────────────────────
create table if not exists public.car_brands (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug = lower(slug) and slug <> ''),
  name_en    text not null,
  name_ar    text not null,
  logo_url   text,                                   -- OPTIONAL manual override only
  created_at timestamptz not null default now()
);

comment on table public.car_brands is
  'Global (non-tenant) car-brand reference list. slug = source of truth; logo_url is an optional manual override (logos are otherwise derived from slug via a free CDN at render time).';

-- ── 2. RLS — public read, owner/admin write ─────────────────────────────────
alter table public.car_brands enable row level security;

-- Anyone (anon storefront + authenticated dashboard) may read the brand list.
drop policy if exists "car_brands: public read" on public.car_brands;
create policy "car_brands: public read"
  on public.car_brands for select to public
  using (true);

-- Only an authenticated owner/admin (of any tenant) may add a brand.
drop policy if exists "car_brands: insert (owner/admin)" on public.car_brands;
create policy "car_brands: insert (owner/admin)"
  on public.car_brands for insert to authenticated
  with check (
    exists (
      select 1 from public.tenant_users tu
      where tu.user_id = auth.uid()
        and tu.role = any (array['owner'::user_role, 'admin'::user_role])
    )
  );

drop policy if exists "car_brands: update (owner/admin)" on public.car_brands;
create policy "car_brands: update (owner/admin)"
  on public.car_brands for update to authenticated
  using (
    exists (
      select 1 from public.tenant_users tu
      where tu.user_id = auth.uid()
        and tu.role = any (array['owner'::user_role, 'admin'::user_role])
    )
  );

drop policy if exists "car_brands: delete (owner/admin)" on public.car_brands;
create policy "car_brands: delete (owner/admin)"
  on public.car_brands for delete to authenticated
  using (
    exists (
      select 1 from public.tenant_users tu
      where tu.user_id = auth.uid()
        and tu.role = any (array['owner'::user_role, 'admin'::user_role])
    )
  );

-- ── 3. Seed starter brand list (extend with brands found in inventory) ───────
-- slug = lowercase, hyphenated. ON CONFLICT keeps re-runs idempotent.
insert into public.car_brands (slug, name_en, name_ar) values
  ('toyota',        'Toyota',         'تويوتا'),
  ('bmw',           'BMW',            'بي إم دبليو'),
  ('mercedes-benz', 'Mercedes-Benz',  'مرسيدس-بنز'),
  ('audi',          'Audi',           'أودي'),
  ('kia',           'Kia',            'كيا'),
  ('hyundai',       'Hyundai',        'هيونداي'),
  ('lexus',         'Lexus',          'لكزس'),
  ('nissan',        'Nissan',         'نيسان'),
  ('chevrolet',     'Chevrolet',      'شيفروليه'),
  ('byd',           'BYD',            'بي واي دي'),
  ('honda',         'Honda',          'هوندا'),
  ('ford',          'Ford',           'فورد'),
  ('volkswagen',    'Volkswagen',     'فولكس فاجن'),
  ('mazda',         'Mazda',          'مازدا'),
  ('mitsubishi',    'Mitsubishi',     'ميتسوبيشي'),
  ('renault',       'Renault',        'رينو'),
  ('peugeot',       'Peugeot',        'بيجو'),
  ('jeep',          'Jeep',           'جيب'),
  ('land-rover',    'Land Rover',     'لاند روفر'),
  ('porsche',       'Porsche',        'بورش'),
  -- extended with brands present in existing inventory / bundled assets:
  ('tesla',         'Tesla',          'تسلا'),
  ('range-rover',   'Range Rover',    'رينج روفر')
on conflict (slug) do nothing;

-- ── 4. cars.brand_slug column (nullable; legacy cars.brand kept) ─────────────
alter table public.cars
  add column if not exists brand_slug text;

-- ── 5. Normalize + link existing free-text cars.brand → car_brands.slug ──────
-- Resolution order per car (first hit wins): exact slug match of a hyphenated,
-- lowercased candidate → exact name_en match → known alias/typo map. Cars with
-- no hit keep brand_slug NULL and their original cars.brand (NOTHING dropped).
update public.cars c
set brand_slug = resolved.slug
from (
  select c2.id,
         coalesce(bd.slug, bn.slug, al.slug) as slug
  from public.cars c2
  cross join lateral (
    select lower(btrim(c2.brand))                              as flat,
           regexp_replace(lower(btrim(c2.brand)), '\s+', '-', 'g') as cand
  ) k
  left join public.car_brands bd on bd.slug = k.cand
  left join public.car_brands bn on lower(bn.name_en) = k.flat
  left join (values
      ('toyouta','toyota'), ('toyta','toyota'), ('toyoto','toyota'),
      ('mercedes','mercedes-benz'), ('mercedes benz','mercedes-benz'), ('benz','mercedes-benz'),
      ('vw','volkswagen'), ('volkswagon','volkswagen'),
      ('chevy','chevrolet'), ('chevrolet ','chevrolet'),
      ('rangerover','range-rover'), ('range rover','range-rover'),
      ('landrover','land-rover'),
      ('hyundia','hyundai'), ('hyundi','hyundai'),
      ('mercedez','mercedes-benz')
    ) as al(variant, slug) on al.variant = k.flat
  where c2.brand_slug is null and c2.brand is not null
) resolved
where c.id = resolved.id and resolved.slug is not null;

-- ── 6. FK: cars.brand_slug → car_brands.slug (idempotent via guard) ──────────
-- ON UPDATE CASCADE: a future slug rename propagates. ON DELETE SET NULL: removing
-- a brand leaves the car readable (legacy cars.brand text stays).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cars_brand_slug_fkey'
  ) then
    alter table public.cars
      add constraint cars_brand_slug_fkey
      foreign key (brand_slug) references public.car_brands(slug)
      on update cascade on delete set null;
  end if;
end$$;

-- ── 7. Index for storefront brand grouping (per tenant) ──────────────────────
create index if not exists idx_cars_tenant_brand_slug
  on public.cars (tenant_id, brand_slug);

-- ── 8. Reload PostgREST schema cache so the new table/column are exposed ──────
notify pgrst, 'reload schema';

-- ============================================================================
-- REPORT QUERIES — run these AFTER apply to verify normalization (read-only):
--
--   -- which free-text brands mapped to which slug, and how many cars:
--   select brand, brand_slug, count(*) as cars
--   from public.cars group by brand, brand_slug order by brand_slug nulls last, brand;
--
--   -- UNMATCHED values (brand_slug NULL) — review and either add the brand to
--   -- car_brands or fix the source string, then re-run section 5:
--   select brand, count(*) as cars
--   from public.cars where brand_slug is null group by brand order by cars desc;
-- ============================================================================
