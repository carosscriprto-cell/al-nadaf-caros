# Caros — Architecture

How the system works. Pairs with [OVERVIEW.md](./OVERVIEW.md) (what it is) and [ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md) (operational runbook).

## 1. Multi-tenancy model

**One codebase, one deployment, one database.** A tenant is a **row in `public.tenants`**, never a separate build or folder. Isolation is enforced at the database by `tenant_id` + RLS, not by routing or app code.

### Tenant resolution (storefront)

```
request host ──▶ middleware.ts ──▶ resolveTenantId(host) ──▶ Postgres RPC ──▶ x-tenant-id header
                                                                                   │
                                              getTenantId() / getTenantConfig() ◀──┘  (server components)
```

1. **`middleware.ts`** runs on every storefront request. It reads `host`, calls `resolveTenantId(host)`, and on success forwards the resolved id as the **`x-tenant-id`** request header (plus `x-tenant-host`). An unresolved host returns a **real 404** (HTML returned straight from middleware, so the status is 404 — a `notFound()` in the render tree would stream a 200 first because every route sits under a `loading.tsx`).
2. **`lib/tenant/resolveTenant.ts`** is edge-safe (talks to Supabase via PostgREST RPC over `fetch` — no `supabase-js`/`ws` in the middleware bundle). Resolution order:
   - **Subdomain** (first host label, e.g. `dealer1` in `dealer1.lvh.me`) → `get_tenant_id_by_slug(slug)`.
   - **Full host** → `get_tenant_id_by_domain(host)` (matches `tenants.domain` *or* `tenants.subdomain`) — for custom domains.
   - **`DEFAULT_TENANT_SLUG`** fallback → only when there is **no** subdomain (plain `localhost` / apex), for local dev.
   - An explicit subdomain that maps to nothing does **not** fall back to default (that would leak another dealer's data) → 404.
3. **`lib/supabase/getTenant.ts`** reads `x-tenant-id` (`getTenantId()`), then `getTenantConfig()` loads the `tenants` row (anon client, RLS-scoped, `active = true`). Both are wrapped in React `cache()` → one DB read per request even when many components ask.

### Dashboard / auth routes are different

`/dashboard` and `/auth` are **not** host-scoped. The middleware skips host resolution for them and instead runs a Supabase **session check** (`supabase.auth.getUser()` — validates the token, also refreshes the session cookie). Unauthenticated `/dashboard` → redirect to `/auth/login?redirectTo=…`; an authenticated user hitting `/auth/*` → redirect to `/dashboard`. The dashboard's tenant is the logged-in user's tenant, resolved server-side via `my_tenant_id()` (their `tenant_users` row).

## 2. Data model

All tables live in `public`. Schema is version-controlled under `supabase/migrations/` (baseline `20260101000000_baseline_schema.sql`, then dated migrations). Generated TS types: `lib/supabase/database.types.ts`. DB rows → app `Car` etc. via `lib/supabase/mappers.ts`.

### Tables

| Table | Purpose | Key columns |
|---|---|---|
| **`tenants`** | One row per dealer (the tenant) | `id`, `name`, `name_ar`, `slug` (unique), `subdomain` (unique), `domain` (unique), `active`, `plan`, `color_primary/secondary/accent`, `logo_url`, `favicon_url`, `og_image_url`, `email`, `phone`, `whatsapp`, `address_en/ar`, SEO `seo_title_*`/`seo_desc_*`, + jsonb columns (below) |
| **`tenant_users`** | Links an `auth.users` user → a tenant with a role | `tenant_id`, `user_id`, `role` (`owner`/`admin`/`editor`), unique `(tenant_id, user_id)` |
| **`cars`** | Inventory, tenant-scoped | `tenant_id`, `slug` (unique per tenant), `brand`, `model`, `year`, `listing_type`, `condition`, `category`, `class`, `fuel_type`, `transmission`, pricing (`price_daily/total/…`, `currency`), specs, merchandising flags (`is_featured`/`is_popular`/…), `available`, `thumbnail`, `images[]` |
| **`car_content`** | Localized marketing copy, one row per car per locale | `car_id`, `locale` (`ar`/`en`), `title`, descriptions, feature arrays, `warranty`, unique `(car_id, locale)` |
| **`leads`** | Lead/booking capture (unified — no separate bookings table) | `tenant_id`, `car_id?`, `name/email/phone/message`, `type`, `status`, `source`, `locale`, `rental_start/rental_end/pickup_location`, `whatsapp_opened` |
| **`tenant_pages`** | (baseline) per-tenant custom pages table | `tenant_id`, `slug`, `title_*`, `content` jsonb — distinct from the `tenants.pages` toggle column; lightly used |

### `tenants` jsonb columns (white-label config)

| Column | Shape | Parser / default |
|---|---|---|
| `features` | `{ maxCars, maxImagesPerCar, enableSellCar, enableRental, enableFinancing, enableWhatsApp, enableVipDelivery, enableEmailContact, enablePhoneContact }` | `parseTenantFeatures` → `DEFAULT_FEATURES` (all-on) for missing keys |
| `sections` | ordered `[{ key, enabled }]` of home sections | `parseSections` → `DEFAULT_SECTIONS` (all on, canonical order); `hero` is always-on |
| `pages` | `{ about, leadAvailability, leadViewing }` toggles | `parseTenantPages` → default **true** |
| `content` | bilingual section overrides, each `{ en, ar }`: `hero` `{badge, headline, subheadline}`, `whyChooseUs`/`howItWorks` `{title, description, items[]}`, `about` `{heading, body}`, `financing`/`finalCta` `{title, desc, cta}`, `faq` `[{q, a}]` | `parseTenantContent` → **per-field** fallback to static i18n (empty field = original copy) |
| `business_hours`, `social`, `map_center` | tenant contact/map config | resolved in `lib/tenant/branding.ts` |

### Enums (current, after `extend_market_enums`)

| Enum | Values |
|---|---|
| `tenant_plan` | `starter`, `pro`, `enterprise` |
| `user_role` | `owner`, `admin`, `editor` |
| `listing_type` | `rent`, `sale`, `both` |
| `car_condition` | `new`, `used`, `certified` |
| `car_category` | `sedan`, `suv`, `coupe`, `hatchback`, `convertible`, `pickup`, `electric`*, `sports`, `wagon`, `crossover`, `van`, `minivan`, `truck`, `mpv`, `supercar`, `roadster` |
| `car_class` | `economy`, `standard`, `premium`, `luxury`, `executive`, `performance`, `ultra-luxury` |
| `fuel_type` | `petrol`, `diesel`, `hybrid`, `electric`, `plug-in-hybrid` |
| `transmission` | `automatic`, `manual`, `cvt`, `dual-clutch`, `semi-automatic` |
| `drivetrain` | `FWD`, `RWD`, `AWD`, `4WD` |
| `currency` | `USD`, `EUR`, `AED` |
| `content_locale` | `ar`, `en` |

`leads.type` and `leads.status` are **text columns with CHECK constraints**, not enums:
- `type ∈ { inquiry, booking, purchase, availability, viewing }`
- `status ∈ { new, contacted, closed }`

> *`electric` in `car_category` is legacy and overlaps `fuel_type` — a P3 data migration will remap those rows. App code already excludes it where it would surface as a body type. See [ROADMAP.md](./ROADMAP.md).

### Postgres functions (SECURITY DEFINER, `search_path` pinned)
- `my_tenant_id()` → the caller's tenant (from `tenant_users` by `auth.uid()`); the spine of every RLS policy.
- `get_tenant_id_by_slug(p_slug)` / `get_tenant_id_by_domain(p_domain)` → host resolution (used by middleware RPC).
- `mark_latest_lead_whatsapp(p_tenant_id, p_phone)` → flips `whatsapp_opened` on the visitor's just-submitted lead (anon can't UPDATE leads, so a definer fn does it, matched by tenant + phone + recency).

## 3. RLS / security

RLS is **enabled on every tenant-scoped table** (`tenants`, `tenant_users`, `cars`, `car_content`, `tenant_pages`, `leads`). Policies live in `supabase/migrations/20260614091000_rls_policies.sql` and `…100000_p4_public_read_policies.sql`.

**Isolation model:**
- Every authenticated read/write is gated by **`my_tenant_id()`** (directly, or via the parent `car` for `car_content`). UPDATE policies omit `WITH CHECK` on purpose — Postgres applies the `USING` expression to the new row too, so rows can't be moved between tenants.
- **Role escalation** via `tenant_users.role`: delete/admin actions check `role ∈ {admin, owner}`; tenant settings update is `owner`-only.
- **Public storefront (`anon` role)** has SELECT-only policies scoped `TO anon` for **active-tenant** `tenants` / `cars` / `car_content`. The `.eq('tenant_id', …)` in queries is a *"which dealer"* selector, **not** the security boundary — the boundary is RLS.
- **Leads are write-only for the public:** anon may **INSERT** a lead but only for an **active** tenant (`WITH CHECK exists(active tenant)`), and there is **no anon SELECT policy** (PII). Inactive tenants are invisible to everyone public.

**`scripts/test-rls.ts`** is the executable proof and **must stay green**. It spins up a disposable tenant B (service role), then asserts: anon can read active public cars but not leads; anon can insert a lead for an active tenant (no `RETURNING`) but not for a bogus tenant; anon cannot write cars; and a real tenant-A user cannot SELECT/UPDATE/INSERT into tenant B (cars, leads, settings). Teardown always runs in `finally`. Run it after any schema/policy change.

## 4. Feature gating (plans → features)

- **`lib/tenant/features.ts`** defines `TenantFeatures`, `DEFAULT_FEATURES` (all-on fallback), and helpers: `allowedListingTypes`, **`isHybridTenant`** (`enableSellCar && enableRental`), `storefrontListingTypes`.
- **`lib/tenant/plans.ts`** maps each plan to a **features preset** + capabilities (`getPlanFeatures(plan)`, `getPlanCapabilities`, `planAllowsHybrid/CustomDomain/Expandable`).

| Plan | maxCars | rental | financing | VIP delivery | hybrid allowed |
|---|---|---|---|---|---|
| starter | 25 | ✗ | ✗ | ✗ | ✗ (sale-only default) |
| pro | 75 | ✓ | ✓ | ✗ | ✓ |
| enterprise | 200 | ✓ | ✓ | ✓ | ✓ |

> **Plans are presets, not runtime enforcement.** `tenants.features` is the runtime authority and stays per-tenant editable; features may legitimately exceed the plan (manual onboarding / upsell). Hard enforcement is deferred to V3 billing. Apply `getPlanFeatures(plan)` when onboarding a tenant.

**How gating flows:** `getStorefrontFeatures()` parses `tenants.features` → drives storefront behavior (e.g. the hero's 4th filter slot: hybrid → listing type, sale-only → condition, rental-only → body type; financing section auto-hidden unless `enableFinancing`). The dashboard reads the same flags to show/hide capabilities.

## 5. Storefront vs dashboard

| | Storefront (`app/[locale]/…`) | Dashboard (`app/dashboard/…`) |
|---|---|---|
| Tenant scope | request **host** → `x-tenant-id` | logged-in **user** → `my_tenant_id()` |
| Supabase client | `createPublicServerClient()` (anon, RLS) | authenticated (cookie session) / service role for trusted writes |
| Audience | public visitors → leads | dealer staff (owner/admin/editor) |
| Locale | `/[locale]` (ar/en), RTL | bilingual UI (Cairo + IBM Plex Arabic) |

**Providers** (set in `app/[locale]/layout.tsx`, consumed via hooks) carry per-tenant data to client components so they never read static config:
- `TenantFeaturesProvider` → `useTenantFeatures()`
- `TenantContactProvider` → contact/social/hours
- `TenantPagesProvider` → page/button toggles
- `TenantContentProvider` → editable section copy
- (plus `ThemeProvider` for next-themes, `UiLoadingProvider`)

## 6. Lead flow

```
visitor fills capture form / car CTA
        │
        ▼
submitLead()  (lib/leads/submit.ts, 'use server', ANON client)
   • validates with Zod (lib/leads/schema)
   • tenant_id from x-tenant-id header (never from the client)
   • INSERT into leads  — WRITE-ONLY, no .select()/RETURNING
        │  (anon has no SELECT policy on leads; RETURNING would 42501 → rollback)
        ▼
   lead row persisted (the record)
        │
        ▼  (optional, client-side, conscious choice)
   WhatsApp deep-link to tenant.whatsapp  → mark_latest_lead_whatsapp() flips whatsapp_opened
```

DB = the record, WhatsApp = the channel. Both happen; neither replaces the other. The dealer reads/updates leads in `/dashboard/leads` (own-tenant only, via RLS).

## 7. Design system

- **Tokens** live in `app/globals.css` as Tailwind v4 `@theme` variables mapping `--color-*` utilities to semantic CSS vars, with light values in `:root` and dark overrides in `.dark` (next-themes `class` strategy). Three text tiers (`foreground` / `muted-foreground` / `foreground-tertiary`), hairline `border`, `accent` + derived `accent-strong` (CTA) / `accent-subtle` (tint), radius (8/12/16/24) and soft shadow scales.
- **Per-tenant accent (white-label):** `app/[locale]/layout.tsx` injects `--color-primary/secondary/accent` from the `tenants` row as inline CSS vars on `<body>`, overriding the defaults at runtime. `accent-strong`/`accent-subtle` derive from `--color-accent` via OKLCH relative color, so they track the tenant brand automatically.
- **Fonts** (`lib/fonts.ts`, wired in the layout + `--font-*` tokens): storefront body = **Inter** (Latin) + **IBM Plex Sans Arabic** (Arabic fallback in the `--font-sans` stack); hero/display headings = **Space Grotesk** (`--font-heading`, Arabic falls back to IBM Plex). Dashboard = Cairo + IBM Plex Sans Arabic.
