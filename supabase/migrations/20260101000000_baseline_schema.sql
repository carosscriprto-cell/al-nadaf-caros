-- ============================================================================
-- Phase 2 · Task 3 — Baseline schema (schema-only, RLS excluded)
-- ============================================================================
-- Docker-free reconstruction (supabase db dump was unavailable). Sources:
--   * columns/types/nullability/defaults-presence — database.types.ts
--   * enum values — database.types.ts Constants (pre-P2; extend_market_enums adds rest)
--   * FK relationships — database.types.ts "Relationships"
--   * numeric precisions — provided: numeric(10,2) money, numeric(5,2) fuel, numeric(3,2) rating
--   * my_tenant_id() + get_tenant_id_by_domain() bodies — confirmed live this session
--
-- PROVENANCE NOTES (reconstructed by convention where no dump existed):
--   * PK = id on every table; UNIQUE/index set below is the conventional set
--     justified by app query patterns — verify against the Dashboard if exactness
--     matters for a fresh rebuild.
--   * get_tenant_id_by_slug() body is INFERRED by analogy to the domain resolver
--     and lib/supabase/tenant.ts (slug + active) — confirm if needed.
--   * Functions here are the ORIGINAL (un-hardened) bodies — baseline reflects the
--     live schema as-is; harden_my_tenant_id migration pins search_path afterward.
--
-- RLS intentionally EXCLUDED — see 20260614091000_rls_policies.sql.
-- Apply order: THIS → extend_market_enums → harden_my_tenant_id → rls_policies.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists pg_trgm;  -- implied by show_trgm()/show_limit()

-- ── Enums (pre-P2 values) ─────────────────────────────────────────────────--
create type public.car_category as enum ('sedan','suv','coupe','hatchback','convertible','pickup','electric','sports');
create type public.car_class    as enum ('economy','standard','premium','luxury','executive','performance','ultra-luxury');
create type public.car_condition as enum ('new','used','certified');
create type public.content_locale as enum ('ar','en');
create type public.currency      as enum ('USD','EUR','AED');
create type public.drivetrain    as enum ('FWD','RWD','AWD','4WD');
create type public.fuel_type     as enum ('petrol','diesel','hybrid','electric');
create type public.listing_type  as enum ('rent','sale','both');
create type public.tenant_plan   as enum ('starter','pro','enterprise');
create type public.transmission  as enum ('automatic','manual');
create type public.user_role     as enum ('owner','admin','editor');

-- ── tenants ───────────────────────────────────────────────────────────────--
create table public.tenants (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  name_ar         text,
  slug            text not null unique,
  subdomain       text unique,
  domain          text unique,
  active          boolean not null default true,
  plan            public.tenant_plan not null default 'starter',
  color_primary   text not null default '#000000',
  color_secondary text not null default '#ffffff',
  color_accent    text not null default '#3b82f6',
  logo_url        text,
  favicon_url     text,
  og_image_url    text,
  email           text,
  phone           text,
  whatsapp        text,
  address_ar      text,
  address_en      text,
  business_hours  jsonb,
  map_center      jsonb,
  social          jsonb,
  features        jsonb not null default '{}'::jsonb,
  seo_title_ar    text,
  seo_title_en    text,
  seo_desc_ar     text,
  seo_desc_en     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── tenant_users ──────────────────────────────────────────────────────────--
create table public.tenant_users (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.user_role not null default 'editor',
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

-- ── cars ────────────────────────────────────────────────────────────────────
create table public.cars (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  slug                text not null,
  brand               text not null,
  model               text not null,
  trim                text,
  year                integer not null,
  listing_type        public.listing_type not null,
  condition           public.car_condition not null,
  category            public.car_category not null,
  class               public.car_class not null,
  available           boolean not null default true,
  is_hero             boolean,
  is_featured         boolean,
  is_popular          boolean,
  is_new_arrival      boolean,
  is_best_seller      boolean,
  transmission        public.transmission not null,
  fuel_type           public.fuel_type not null,
  drivetrain          public.drivetrain,
  seats               integer not null,
  doors               integer not null,
  mileage             integer not null default 0,
  color               text,
  interior_color      text,
  engine              text,
  cylinders           integer,
  horsepower          integer,
  torque              integer,
  top_speed           integer,
  acceleration        text,
  electric_range      integer,                       -- km (judgment; not money/fuel)
  fuel_tank_capacity  numeric(5,2),
  fuel_city           numeric(5,2),
  fuel_highway        numeric(5,2),
  fuel_combined       numeric(5,2),
  fuel_per_20km       numeric(5,2),
  currency            public.currency not null default 'USD',
  price_hourly        numeric(10,2),
  price_daily         numeric(10,2),
  price_weekly        numeric(10,2),
  price_monthly       numeric(10,2),
  price_total         numeric(10,2),
  price_old           numeric(10,2),
  monthly_installment numeric(10,2),
  security_deposit    numeric(10,2),
  min_rental_days     integer,
  negotiable          boolean,
  financing_available boolean,
  delivery_available  boolean,
  pickup_locations    text[],
  city                text not null,
  country             text not null,
  address             text,
  owners_count        integer,
  accident_free       boolean,
  service_history     boolean,
  thumbnail           text,
  images              text[],
  rating              numeric(3,2),
  reviews_count       integer,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (tenant_id, slug)
);

-- ── car_content (one row per car per locale) ────────────────────────────────
create table public.car_content (
  id                     uuid primary key default gen_random_uuid(),
  car_id                 uuid not null references public.cars(id) on delete cascade,
  locale                 public.content_locale not null,
  title                  text not null,
  short_description      text,
  description            text,
  ideal_for              text[],
  pros                   text[],
  cons                   text[],
  features               text[],
  comfort_features       text[],
  safety_features        text[],
  entertainment_features text[],
  requirements           text[],
  included_services      text[],
  warranty               text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (car_id, locale)
);

-- ── leads ───────────────────────────────────────────────────────────────────
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  car_id     uuid references public.cars(id) on delete set null,
  name       text,
  email      text,
  phone      text,
  message    text,
  source     text,
  status     text default 'new',                     -- convention
  locale     public.content_locale,
  created_at timestamptz not null default now()
);

-- ── tenant_pages ────────────────────────────────────────────────────────────
create table public.tenant_pages (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  slug       text not null,
  title_ar   text,
  title_en   text,
  content    jsonb,
  active     boolean not null default true,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

-- ── Indexes (conventional set, justified by query patterns) ─────────────────
create index idx_tenant_users_user_id on public.tenant_users (user_id);          -- my_tenant_id() lookup
create index idx_cars_tenant_available on public.cars (tenant_id, available);    -- public listings
create index idx_cars_tenant_featured on public.cars (tenant_id, is_featured);   -- featured carousel
create index idx_leads_tenant_created on public.leads (tenant_id, created_at desc); -- dashboard leads

-- GIN full-text index on car_content ('simple' config — multi-locale ar/en, no stemming)
create index idx_car_content_fts on public.car_content
  using gin (to_tsvector('simple',
    coalesce(title,'') || ' ' || coalesce(short_description,'') || ' ' || coalesce(description,'')));

-- Optional trigram index for fuzzy brand/model search (pg_trgm enabled):
create index idx_cars_brand_model_trgm on public.cars
  using gin ((brand || ' ' || model) gin_trgm_ops);

-- ── Functions (ORIGINAL, un-hardened — harden migration pins search_path) ───--
create or replace function public.my_tenant_id()
returns uuid
language sql
stable
security definer
as $$
  select tenant_id
  from tenant_users
  where user_id = auth.uid()
  limit 1
$$;

create or replace function public.get_tenant_id_by_domain(p_domain text)
returns uuid
language sql
stable
security definer
as $$
  select id
  from tenants
  where (domain = p_domain or subdomain = p_domain)
    and active = true
  limit 1
$$;

-- NOTE: body inferred by analogy to get_tenant_id_by_domain + lib/supabase/tenant.ts.
create or replace function public.get_tenant_id_by_slug(p_slug text)
returns uuid
language sql
stable
security definer
as $$
  select id
  from tenants
  where slug = p_slug
    and active = true
  limit 1
$$;
