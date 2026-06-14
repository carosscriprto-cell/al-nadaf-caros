-- ============================================================================
-- Phase 2 · Task 3 — Baseline schema (schema-only, RLS excluded)
-- ============================================================================
-- Reconstructed WITHOUT a Docker-based `supabase db dump` (Docker unavailable),
-- from data gathered this session:
--   * column structure, types, nullability, defaults-presence — from the
--     generated lib/supabase/database.types.ts (Row/Insert shapes)
--   * enum values — from database.types.ts Constants (pre-P2 values; the
--     extend_market_enums migration adds the rest)
--   * FK relationships — from database.types.ts "Relationships"
--   * my_tenant_id() body — confirmed live this session
--
-- RLS is intentionally EXCLUDED — it lives in 20260614091000_rls_policies.sql.
-- Apply order: THIS → extend_market_enums → harden_my_tenant_id → rls_policies.
--
-- ⚠️ VERIFY-FROM-DASHBOARD gaps (flagged inline as TODO, not guessed):
--   * exact numeric types (int vs numeric/precision) — TS collapses all to `number`
--   * PRIMARY KEY / UNIQUE constraints, INDEXes, sequences
--   * get_tenant_id_by_domain() / get_tenant_id_by_slug() bodies (not captured)
--   * exact DEFAULT expressions for booleans/enums/jsonb/colors
--   * user_id FK to auth.users
-- A 90%-accurate, clearly-flagged baseline — confirm the TODOs before relying on
-- it to recreate a fresh environment.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
-- pg_trgm is implied by the show_limit()/show_trgm() functions present in the DB
-- (trigram search). gen_random_uuid() is built-in on PG13+.
create extension if not exists pg_trgm;

-- ── Enums (pre-P2 values; extend_market_enums adds market-complete values) ────
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
  id              uuid primary key default gen_random_uuid(),  -- TODO confirm PK
  name            text not null,
  name_ar         text,
  slug            text not null,                               -- TODO confirm UNIQUE
  subdomain       text,                                        -- TODO confirm UNIQUE
  domain          text,                                        -- TODO confirm UNIQUE
  active          boolean not null default true,               -- TODO confirm default
  plan            public.tenant_plan not null default 'starter', -- TODO confirm default
  color_primary   text not null default '#000000',             -- TODO confirm default
  color_secondary text not null default '#ffffff',             -- TODO confirm default
  color_accent    text not null default '#3b82f6',             -- TODO confirm default
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
  features        jsonb not null default '{}'::jsonb,           -- TODO confirm default ({} vs [])
  seo_title_ar    text,
  seo_title_en    text,
  seo_desc_ar     text,
  seo_desc_en     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── tenant_users ──────────────────────────────────────────────────────────--
create table public.tenant_users (
  id         uuid primary key default gen_random_uuid(),       -- TODO confirm PK
  tenant_id  uuid not null references public.tenants(id),      -- FK (from generated Relationships)
  user_id    uuid not null,                                    -- TODO FK -> auth.users(id) (confirm)
  role       public.user_role not null default 'editor',       -- TODO confirm default
  created_at timestamptz not null default now()
  -- TODO confirm UNIQUE (tenant_id, user_id)
);

-- ── cars ────────────────────────────────────────────────────────────────────
-- TODO numeric types: integers chosen for counts; numeric for money/measures.
-- Confirm exact types/precision against the DB.
create table public.cars (
  id                  uuid primary key default gen_random_uuid(), -- TODO confirm PK
  tenant_id           uuid not null references public.tenants(id), -- FK
  slug                text not null,                            -- TODO confirm UNIQUE (per tenant?)
  brand               text not null,
  model               text not null,
  trim                text,
  year                integer not null,
  listing_type        public.listing_type not null,
  condition           public.car_condition not null,
  category            public.car_category not null,
  class               public.car_class not null,
  available           boolean not null default true,            -- TODO confirm default
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
  mileage             integer not null,                         -- TODO confirm default (0?)
  color               text,
  interior_color      text,
  engine              text,
  cylinders           integer,
  horsepower          integer,
  torque              integer,
  top_speed           integer,
  acceleration        text,
  electric_range      numeric,
  fuel_tank_capacity  numeric,
  fuel_city           numeric,
  fuel_highway        numeric,
  fuel_combined       numeric,
  fuel_per_20km       numeric,
  currency            public.currency not null default 'USD',   -- TODO confirm default
  price_hourly        numeric,
  price_daily         numeric,
  price_weekly        numeric,
  price_monthly       numeric,
  price_total         numeric,
  price_old           numeric,
  monthly_installment numeric,
  security_deposit    numeric,
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
  rating              numeric,
  reviews_count       integer,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── car_content (one row per car per locale) ────────────────────────────────
create table public.car_content (
  id                     uuid primary key default gen_random_uuid(), -- TODO confirm PK
  car_id                 uuid not null references public.cars(id),    -- FK
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
  updated_at             timestamptz not null default now()
  -- TODO confirm UNIQUE (car_id, locale)
);

-- ── leads ───────────────────────────────────────────────────────────────────
create table public.leads (
  id         uuid primary key default gen_random_uuid(),       -- TODO confirm PK
  tenant_id  uuid not null references public.tenants(id),      -- FK
  car_id     uuid references public.cars(id),                  -- FK (nullable)
  name       text,
  email      text,
  phone      text,
  message    text,
  source     text,
  status     text,                                             -- TODO confirm default ('new'?)
  locale     public.content_locale,
  created_at timestamptz not null default now()
);

-- ── tenant_pages ────────────────────────────────────────────────────────────
create table public.tenant_pages (
  id         uuid primary key default gen_random_uuid(),       -- TODO confirm PK
  tenant_id  uuid not null references public.tenants(id),      -- FK
  slug       text not null,                                    -- TODO confirm UNIQUE (tenant_id, slug)
  title_ar   text,
  title_en   text,
  content    jsonb,
  active     boolean not null default true,                    -- TODO confirm default
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Functions ─────────────────────────────────────────────────────────────--
-- ORIGINAL my_tenant_id() (unhardened) — the harden_my_tenant_id migration adds
-- SET search_path='' + schema-qualification on top of this.
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

-- TODO: get_tenant_id_by_domain(p_domain text) returns uuid — body not captured.
-- TODO: get_tenant_id_by_slug(p_slug text)   returns uuid — body not captured.
--       Retrieve from Dashboard (Database → Functions) and add here.

-- ── Indexes ─────────────────────────────────────────────────────────────────
-- TODO: add indexes (none captured). Likely candidates given query patterns:
--   * cars (tenant_id), cars (tenant_id, available), cars (slug)
--   * car_content (car_id, locale)
--   * leads (tenant_id, created_at)
--   * tenant_users (user_id), tenant_users (tenant_id)
--   * trigram (pg_trgm) indexes on cars brand/model if used for search
