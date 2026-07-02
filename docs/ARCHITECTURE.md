# Caros — Architecture

How the system actually works. Pairs with [OVERVIEW.md](./OVERVIEW.md) (what it is) and
[ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md) (operational runbook). Every claim here
traces to a file — paths are given so you can verify.

## 1. Multi-tenancy model

**One codebase, one deployment, one database.** A tenant is a row in `public.tenants`.
Isolation is enforced at the database by `tenant_id` + RLS, never by routing or app code.

### Route groups

```
app/
  (site)/[locale]/…     storefront — tenant scoped by request HOST
  (system)/dashboard/…  dealer app — tenant scoped by logged-in USER
  (system)/auth/login   Supabase auth
  (system)/not-found.tsx, (system)/loading.tsx
  robots.txt/route.ts, sitemap.xml/route.ts
```

The two route groups have **separate root layouts** and separate tenant-scoping mechanisms.

### Tenant resolution (storefront) — `middleware.ts` + `lib/tenant/resolveTenant.ts`

```
request host ─▶ middleware.ts ─▶ resolveTenantId(host) ─▶ Supabase PostgREST RPC
                                                                 │
                          x-tenant-id request header ◀───────────┘
                                     │
        getTenantId() / getTenantConfig()  (server components, lib/supabase/getTenant.ts)
```

1. `middleware.ts` runs on every request (matcher excludes `_next` + static assets). For
   storefront hosts it reads `host`, calls `resolveTenantId(host)`, and forwards the resolved
   id as the **`x-tenant-id`** header (plus `x-tenant-host`). An **unresolved host returns a
   real 404** — the 404 HTML is returned straight from the middleware, because a `notFound()`
   in the render tree would stream a `200` first (every route sits under a `loading.tsx`).

2. `lib/tenant/resolveTenant.ts` is **edge-safe** — it talks to Supabase via PostgREST RPC
   over `fetch` (no `supabase-js`/`ws` in the middleware bundle), `cache: 'no-store'`.
   Resolution order in `resolveTenantId(host)`:
   - **Subdomain** → `get_tenant_id_by_slug(p_slug)`. The subdomain is extracted by
     `extractSubdomain(host)`:
     - `localhost`, bare IPs, and **any `*.vercel.app`** host → `null` (no tenant subdomain),
       so bare Vercel URLs fall through to the default rather than 404.
     - If `NEXT_PUBLIC_ROOT_DOMAIN` is set: subdomain = host with the root domain stripped
       (`caros.com` / `www.caros.com` → `null`). Any host **not** under the root domain →
       `null` (treated as a custom domain, resolved by full host below).
     - If `NEXT_PUBLIC_ROOT_DOMAIN` is unset (local dev): legacy heuristic — a host with more
       than 2 labels has its first label as the subdomain (so `dealer1.lvh.me` → `dealer1`).
   - **Full host** → `get_tenant_id_by_domain(p_domain)` (matches `tenants.domain` **or**
     `tenants.subdomain`) — for custom domains.
   - **`DEFAULT_TENANT_SLUG`** fallback → only when there is **no** subdomain (plain
     localhost / apex / `*.vercel.app`). The env value is sanitized (quotes/whitespace
     stripped) and **hard-defaults to `'dealer1'`** if empty.
   - An explicit subdomain that maps to nothing does **not** silently fall back to default
     (that would leak another dealer's data) → it tries a custom-domain match then returns
     `null` → 404.

3. `lib/supabase/getTenant.ts` reads the header: `getTenantId()` returns `x-tenant-id` (or
   `notFound()`); `getTenantConfig()` loads the `tenants` row (anon client, RLS-scoped,
   `active = true`); `getStorefrontFeatures()` parses `tenants.features`. All three are
   wrapped in React `cache()` → **one DB read per request** no matter how many components ask.

### Dashboard / auth are host-independent

`middleware.ts` detects `/dashboard` and `/auth` and **skips host resolution**. Instead it
runs a Supabase **session check** (`supabase.auth.getUser()` — validates the token and
refreshes the session cookie). Unauthenticated `/dashboard` → redirect to
`/auth/login?redirectTo=…`; an authenticated user hitting `/auth/*` → redirect to
`/dashboard`. The dashboard's tenant is the logged-in user's tenant, resolved server-side via
`my_tenant_id()` (their `tenant_users` row) — see `app/(system)/dashboard/layout.tsx`.

## 2. Data model

Schema is version-controlled in `supabase/migrations/` (baseline
`20260101000000_baseline_schema.sql`, then dated migrations). Generated types:
`lib/supabase/database.types.ts`. DB rows → app types via `lib/supabase/mappers.ts`.

### Tables (all in `public`)

| Table | Purpose | Notable columns |
|---|---|---|
| **`tenants`** | One row per dealer | `id`, `name`, `name_ar`, `slug` (unique), `subdomain` (unique), `domain` (unique), `active`, `plan`, `color_primary/secondary/accent`, `logo_url`, `favicon_url`, `og_image_url`, `email`, `phone`, `whatsapp`, `address_en/ar`, `seo_title_*`/`seo_desc_*`, + jsonb: `features`, `sections`, `pages`, `content`, `business_hours`, `social`, `map_center` |
| **`tenant_users`** | `auth.users` ↔ tenant with a role | `tenant_id`, `user_id`, `role` (`owner`/`admin`/`editor`), unique `(tenant_id, user_id)` |
| **`cars`** | Inventory, tenant-scoped | `tenant_id`, `slug` (unique per tenant), `brand`, `brand_slug` (FK → `car_brands.slug`, nullable), `model`, `year`, `listing_type`, `condition`, `category`, `class`, `available`, `status` (`available`/`sold`/`reserved`), merchandising flags (`is_featured`/`is_popular`/…), specs, pricing (`price_daily/total/…`, `currency`), rental terms (`mileage_limit`, `insurance`, `min_rental_days`, `security_deposit`), `thumbnail`, `images[]` |
| **`car_content`** | Localized copy, one row per car per locale | `car_id`, `locale` (`ar`/`en`), `title`, descriptions, feature arrays, `warranty`, **per-locale** `city`/`address`/`color`/`interior_color`/`pickup_locations` (E4), unique `(car_id, locale)` |
| **`car_brands`** | **Global** (non-tenant) brand reference | `slug` (unique, lowercase), `name_en`, `name_ar`, `logo_url` (optional override). Public-read; owner/admin write |
| **`leads`** | Lead/booking capture (unified — **no separate `bookings` table**) | `tenant_id`, `car_id?`, `name/email/phone/message`, `source`, `type`, `status`, `locale`, `rental_start`/`rental_end`/`pickup_location`, `whatsapp_opened` |
| **`tenant_pages`** | Baseline per-tenant custom-pages table | `tenant_id`, `slug`, `title_*`, `content` jsonb — **distinct** from the `tenants.pages` toggle column; lightly used |

> **`cars` has legacy denormalized columns** `city`/`address`/`color`/`interior_color`/
> `pickup_locations`, kept as an **AR-primary mirror** of the per-locale `car_content` values
> (E4 migration). `cars.city`/`cars.country` are `NOT NULL`; dashboard writes mirror the AR
> content into them (`mapFormToRow` in `app/(system)/dashboard/cars/actions.ts`). The
> storefront reads the per-locale `car_content` values (AR→EN fallback) and only uses `cars.*`
> as an ultimate fallback. `country` stays single (not per-locale).

### `tenants` jsonb columns (white-label config, each has a parser + safe default)

| Column | Parser | Shape / default |
|---|---|---|
| `features` | `parseTenantFeatures` (`lib/tenant/features.ts`) | `TenantFeatures` (`maxCars`, `maxImagesPerCar`, `enableSellCar`, `enableRental`, `enableFinancing`, `enableWhatsApp`, `enableVipDelivery`, `enableEmailContact`, `enablePhoneContact`). `DEFAULT_FEATURES`: mostly on, but `enableFinancing: false`, `maxCars: -1` (unlimited), `maxImagesPerCar: 5` |
| `sections` | `parseSections` / `resolveVisibleSections` (`lib/tenant/sections.ts`) | ordered `[{ key, enabled }]` over `HOME_SECTIONS` = `hero, brandShowcase, featuredCars, whyChooseUs, howItWorks, featuredSpotlight, financing, faq, finalCta`. Default: all on, canonical order. `hero` is always-on. `financing` is auto-hidden unless `enableFinancing` |
| `pages` | `parseTenantPages` (`lib/tenant/pages.ts`) | `{ about, leadAvailability, leadViewing }`, default **all true** |
| `content` | `parseTenantContent` (`lib/tenant/content.ts`) | bilingual per-section overrides; **per-field** fallback to static i18n (blank field = original copy) |
| `business_hours`, `social`, `map_center` | `resolveBusinessHours` / `resolveSocial` / `resolveMapCenter` (`lib/tenant/branding.ts`) | contact/map config; tenant value wins, else `siteConfig` default |

### Enums (after `extend_market_enums`)

| Enum | Values |
|---|---|
| `tenant_plan` | `starter`, `pro`, `enterprise` |
| `user_role` | `owner`, `admin`, `editor` |
| `listing_type` | `rent`, `sale`, `both` |
| `car_condition` | `new`, `used`, `certified` |
| `car_category` | `sedan`, `suv`, `coupe`, `hatchback`, `convertible`, `pickup`, `electric`\*, `sports`, `wagon`, `crossover`, `van`, `minivan`, `truck`, `mpv`, `supercar`, `roadster` |
| `car_class` | `economy`, `standard`, `premium`, `luxury`, `executive`, `performance`, `ultra-luxury` |
| `fuel_type` | `petrol`, `diesel`, `hybrid`, `electric`, `plug-in-hybrid` |
| `transmission` | `automatic`, `manual`, `cvt`, `dual-clutch`, `semi-automatic` |
| `drivetrain` | `FWD`, `RWD`, `AWD`, `4WD` |
| `currency` | `USD`, `EUR`, `AED` |
| `content_locale` | `ar`, `en` |

`leads.type` and `leads.status` are **text columns with CHECK constraints**, not enums:
- `type ∈ { inquiry, booking, purchase, availability, viewing }`
- `status ∈ { new, contacted, closed }`
- `cars.status` is also text + CHECK: `∈ { available, sold, reserved }`

> \* `electric` in `car_category` is legacy and overlaps `fuel_type`. `mapDbCarToCar`
> (`guardCategory` in `lib/supabase/mappers.ts`) logs it but passes it through; a P3 data
> migration to remap those rows is still pending. See [ROADMAP.md](./ROADMAP.md).

### Postgres functions (all `SECURITY DEFINER` with `search_path` pinned)

Defined in `baseline_schema.sql` and hardened in `20260614092000_harden_my_tenant_id.sql`:
- `my_tenant_id()` → the caller's tenant (`tenant_users` by `auth.uid()`). **The spine of every
  authenticated RLS policy.** Known limitation (documented in the harden migration): `limit 1`
  with no `order by` returns an arbitrary tenant if a user ever belongs to more than one —
  safe only while each user maps to exactly one tenant.
- `get_tenant_id_by_slug(p_slug)` / `get_tenant_id_by_domain(p_domain)` → host resolution
  (called by the middleware via RPC).
- `mark_latest_lead_whatsapp(p_tenant_id, p_phone)` (`20260622190000`) → flips
  `leads.whatsapp_opened` on the visitor's just-submitted lead (matched by tenant + phone +
  a 15-minute recency window), since anon can't UPDATE `leads`.

## 3. RLS / security

RLS is enabled on every tenant-scoped table plus `car_brands` and `storage.objects`. Policy
files: `20260614091000_rls_policies.sql`, `20260614100000_p4_public_read_policies.sql`,
`20260616130000_p5a_storage_car_images.sql`, `20260617140000_p5b_leads_bookings.sql`,
`20260627000000_e1e3_car_brands.sql`.

**Isolation model:**
- Every authenticated read/write is gated by **`my_tenant_id()`** (directly, or via the
  parent `car` for `car_content`). **UPDATE policies omit `WITH CHECK` on purpose** — Postgres
  applies the `USING` expression to the new row too, so rows can't be moved between tenants.
- **Role escalation** via `tenant_users.role`: `cars`/`tenant_pages` DELETE and
  `tenant_users` INSERT/DELETE require `role ∈ {admin, owner}` (or owner-only); the
  `tenants` settings UPDATE is **owner-only**.
- **Public storefront (`anon` role)** has SELECT-only policies scoped `TO anon` for
  **active-tenant** `tenants` / `cars` / `car_content`, plus public-read on `car_brands` and
  the `car-images` storage bucket. The `.eq('tenant_id', …)` in queries is a *"which dealer"*
  selector, **not** the security boundary — RLS is.
- **Leads are write-only for the public:** anon may **INSERT** a lead but only for an
  **active** tenant (`WITH CHECK exists(active tenant)` — tightened from the original
  `WITH CHECK (true)` in P5b), and there is **no anon SELECT policy** (PII). Inactive tenants
  are invisible to everyone public.
- **Storage** (`car-images` bucket, path `{tenant_id}/cars/{car_id}/{file}`): anon read;
  authenticated write only within its own `{tenant_id}/` prefix.

**By-design RLS gaps** (service-role only, noted in the policy files): no policies for
`tenants` INSERT/DELETE, `tenant_users` UPDATE, or `leads` DELETE.

**`scripts/test-rls.ts`** is the executable proof. It creates a disposable tenant B (service
role), then asserts: anon reads active public cars but not leads; anon inserts a lead for an
active tenant (no `RETURNING`) but not for a bogus tenant; anon reads `car_brands` but can't
write; the per-locale `car_content` fields are reachable via the active-tenant path; and a
real tenant-A user cannot SELECT/UPDATE/INSERT tenant B's cars/leads/settings. Teardown always
runs in `finally`. It reports **incomplete (fails)** if `TEST_TENANT_A_*` creds are absent, so
a partial run never shows a false green.

## 4. Supabase client layer

Three factories — **use the right one for the trust boundary** (`lib/supabase/client.ts`
unless noted):

| Factory | Role | Use for |
|---|---|---|
| `createPublicServerClient()` | anon key, **RLS enforced**, no session | storefront server reads (`queries.server.ts`), public lead insert |
| `createServerClient()` | **service role, bypasses RLS** | trusted server mutations / scripts only — never public reads |
| `createBrowserClient()` | anon key, **cookie** session via `@supabase/ssr` | client-side auth (dashboard sign-in, image uploads) |
| `createSupabaseServerClient()` — **`lib/supabase/server.ts`** | authenticated (cookie session), runs **as the logged-in user**, RLS applies | dashboard Server Components / Server Actions |

Cookies (not localStorage) matter: the session must be readable by the middleware + server
components, or sign-in appears to "hang" as `/dashboard` bounces back to `/auth/login`.

### Storefront read path

`lib/supabase/queries.server.ts` — all `cache()`-wrapped, all use `createPublicServerClient()`
+ `getTenantId()` + `.eq('tenant_id', …).eq('available', true)`. `getVisibleTypes()` applies
`storefrontListingTypes(features)` so a single-type tenant never surfaces the other listing
type. Functions: `getCarsWithContent`, `getCarBySlug`, `getFeaturedCars`, `getSimilarCars`,
`getAllCarsForSearch` (fetches both AR+EN content maps for the search index). Rows are mapped
via `mapDbCarToCar` / `buildContentMap` (`lib/supabase/mappers.ts`).

## 5. Feature gating (plans → features)

- `lib/tenant/features.ts` — `TenantFeatures`, `DEFAULT_FEATURES`, and helpers
  `allowedListingTypes`, `isHybridTenant` (`enableSellCar && enableRental`),
  `storefrontListingTypes`.
- `lib/tenant/plans.ts` — maps each plan to a features **preset** + capabilities
  (`getPlanFeatures`, `getPlanCapabilities`, `planAllowsHybrid/CustomDomain`, `planIsExpandable`).

| Plan | maxCars | maxImages | rental | financing | VIP delivery | hybrid cap |
|---|---|---|---|---|---|---|
| starter | 25 | 5 | ✗ | ✗ | ✗ | ✗ |
| pro | 75 | 8 | ✓ | ✓ | ✗ | ✓ |
| enterprise | 200 | 12 | ✓ | ✓ | ✓ | ✓ |

> **Plans are presets, not runtime enforcement.** `tenants.features` is the runtime authority
> and stays per-tenant editable; features may legitimately exceed the plan (manual onboarding /
> upsell). Hard enforcement is deferred to V3. The dashboard **does** apply Layer-2 server
> guards from `features` on write — `createCar`/`updateCar` reject over `maxCars` /
> `maxImagesPerCar` (`app/(system)/dashboard/cars/actions.ts`).

**Flow:** `getStorefrontFeatures()` parses `tenants.features` → drives storefront behavior
(e.g. the hero's 4th filter: hybrid → listing type, sale-only → condition, rental-only → body
type; financing section auto-hidden unless `enableFinancing`). The dashboard reads the same
flags to show/hide capabilities.

## 6. Storefront vs dashboard

| | Storefront `app/(site)/[locale]/…` | Dashboard `app/(system)/dashboard/…` |
|---|---|---|
| Tenant scope | request **host** → `x-tenant-id` | logged-in **user** → `my_tenant_id()` |
| Supabase client | `createPublicServerClient()` (anon, RLS) | `createSupabaseServerClient()` (auth cookie, RLS as user); service role only for trusted ops |
| Audience | public visitors → leads | dealer staff (owner/admin/editor) |
| Locale | `/[locale]` (`ar`/`en`), RTL | bilingual UI (Cairo + IBM Plex Arabic), `caros_dash_lang` cookie |

**Storefront providers** (set in `app/(site)/[locale]/layout.tsx`, consumed via hooks) carry
per-tenant data to client components so they never read static config:
`TenantFeaturesProvider` → `useTenantFeatures()`, plus `TenantContactProvider`,
`TenantPagesProvider`, `TenantContentProvider` (and `ThemeProvider`, `UiLoadingProvider`).

## 7. Lead flow

```
visitor fills capture form / car CTA (components/leads/*)
        │
        ▼  submitLead()  (lib/leads/submit.ts, 'use server', ANON client)
   • validates with zod (lib/leads/schema.ts)
   • tenant_id from x-tenant-id header (NEVER from the client)
   • INSERT into leads — WRITE-ONLY, no .select()/RETURNING
        │  (anon has no SELECT policy on leads; RETURNING would 42501 → rollback)
        ▼  lead row persisted (the record)
        │
        ▼  (optional, client-side, conscious choice)
   WhatsApp deep-link to tenant.whatsapp
        │  markLeadWhatsapp(phone) (lib/leads/markWhatsapp.ts)
        ▼  RPC mark_latest_lead_whatsapp() flips whatsapp_opened
```

DB = the record, WhatsApp = the channel. Both happen; neither replaces the other. The dealer
reads/updates leads in `/dashboard/leads` (own-tenant only, via RLS).

## 8. Design system

- **Tokens** live in `app/globals.css` as Tailwind v4 `@theme` variables mapping `--color-*`
  utilities to semantic CSS vars, with light values in `:root` and dark overrides under `.dark`
  (next-themes `class` strategy).
- **Per-tenant accent (white-label):** `app/(site)/[locale]/layout.tsx` injects
  `--color-primary/secondary/accent` from the `tenants` row as inline CSS vars on `<body>`,
  overriding the `globals.css` defaults at runtime.
- **Fonts** are **self-hosted `@font-face`** in `app/fonts.css` (vendored woff2 under
  `public/fonts/`): **Inter** (Latin), **IBM Plex Sans Arabic** and **Cairo** (Arabic +
  Latin), **Space Grotesk** (display). The dashboard uses `--font-cairo`. There is **no
  `lib/fonts.ts`** and **no `next/font`** in this project.
