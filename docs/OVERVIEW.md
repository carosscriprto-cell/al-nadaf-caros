# Caros — Overview

Entry point for developers and AI agents. Read this first, then:
[ARCHITECTURE.md](./ARCHITECTURE.md) (how it works) ·
[DEVELOPMENT.md](./DEVELOPMENT.md) (working on the code) ·
[ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md) (add a dealer) ·
[DEPLOYMENT.md](./DEPLOYMENT.md) (ship it) ·
[ROADMAP.md](./ROADMAP.md) (what's next).

## What Caros is

Caros is a **multi-tenant SaaS** that gives car **dealerships and rental agencies** a
bilingual (Arabic / English, RTL-aware) storefront **plus** a self-service dashboard, from
one codebase, one deployment, one database.

It is **lead-based, not e-commerce** — no cart, no checkout, no online payment. Every
storefront converts a visitor into a **lead**: a row persisted to Postgres, optionally
followed by a **WhatsApp** deep-link to the dealer's number.

Each dealer ("tenant") is a **row in the `public.tenants` table** — not a separate build,
folder, or deploy. Tenants are resolved at runtime from the request host (subdomain or
custom domain) and isolated by `tenant_id` + Postgres Row-Level Security (RLS).

## Tech stack (versions from `package.json`)

| Area | What |
|---|---|
| Framework | **Next.js 15.3.8** (App Router) · **React 19** · **TypeScript 5** (strict) |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) with CSS-first `@theme` tokens in `app/globals.css` · **next-themes** 0.4 (light/dark) · **Radix UI** primitives · **framer-motion** 12 |
| i18n | **next-intl** 4.3 (`ar` / `en`, RTL) — also has `next-i18next` 15 as a dependency |
| Search | **fuse.js** 7 (client-side fuzzy search) |
| Forms | **react-hook-form** 7 + **zod** 4 (`@hookform/resolvers`) |
| Map | **leaflet** 1.9 + **react-leaflet** 5 |
| Backend | **Supabase**: Auth + Postgres + Storage + RLS, via `@supabase/ssr` 0.12 (cookie sessions) and `@supabase/supabase-js` 2 |
| Misc | embla-carousel-react, swiper, sonner (toasts), react-datepicker, lucide-react (icons), tsx (script runner), ws (Node WebSocket for the RLS test) |
| Fonts | **Self-hosted** `@font-face` in `app/fonts.css` (vendored woff2 in `public/fonts/`): Inter, Cairo, IBM Plex Sans Arabic, Space Grotesk. **No `next/font`.** |

Node: not pinned via `engines`; `@types/node` is `^20` — use Node 20 LTS.

## Current state

Shipped and working (verify specifics against code, not this list):

| Area | What exists |
|---|---|
| **Multi-tenancy** | Host → tenant resolution (subdomain / custom domain / `*.vercel.app` fallback), `x-tenant-id` header propagation, per-request cached tenant config (`getTenantConfig`) |
| **Storefront** (`app/(site)/[locale]/`) | Bilingual home with per-tenant configurable **sections**, fleet listing + URL-driven filters, vehicle detail, plus `booking`, `contact`, `about`, `faq`, `services`, `financing`, `privacy`, `terms` pages; client-side fuzzy search (Fuse.js) |
| **Dashboard** (`app/(system)/dashboard/`) | Supabase auth, inventory CRUD + bulk actions + price tools (`/cars`), leads inbox with detail modal (`/leads`), branding/contact settings (`/settings`), white-label site editor (`/site`), overview (`/`) |
| **Leads** | Public write-only capture (DB first, no `RETURNING`) → optional WhatsApp; typed leads (`inquiry` / `booking` / `purchase` / `availability` / `viewing`); rental-window + pickup fields; `whatsapp_opened` follow-up flag |
| **Financing** (`enableFinancing`, P7/P8) | Standalone `/financing` page (route `notFound()` when the flag is off), per-car `is_financeable` opt-out toggle, `down_payment` + `installment_monthly` terms, and an "Installments only" facet (fleet filter + hero toggle). `price_monthly` stays **rental**-only, distinct from the financing instalment. UI term = "التقسيط / Installments" (display rename only) |
| **White-label** | Per-tenant colors (injected as CSS vars on `<body>`; the derived accent shades are re-declared on `body` so they follow the tenant too), logo/favicon/OG, SEO, contact/social/hours/map, home section order+visibility (`sections`), optional pages/buttons (`pages`), editable bilingual copy (`content`). Navbar/footer show the tenant brand (no static fallback); the footer also carries a **permanent, non-configurable "Powered by Caros"** link (→ `caros.scripto-technology.com`), separate from the tenant brand |
| **Brands** | Global `car_brands` reference table; logos derived from slug via a free CDN (`lib/tenant/brandLogo.ts`), optional manual override |
| **Plans & gating** | `starter` / `pro` / `enterprise` presets (`lib/tenant/plans.ts`) → feature flags (`tenants.features`) that gate storefront + dashboard behavior. Presets are onboarding defaults, **not** runtime enforcement |
| **Security** | RLS on every tenant-scoped table; storage RLS on `car-images`; `scripts/test-rls.ts` proves cross-tenant denial |
| **SEO** | `app/sitemap.xml/route.ts`, `app/robots.txt/route.ts`, per-tenant metadata + Organization JSON-LD, per-tenant `metadataBase` (each tenant independently indexable) |

## Quick start

### Prerequisites
- Node 20 LTS + npm
- A Supabase project (URL + anon key + service-role key), with the migrations in
  `supabase/migrations/` applied (see [DEVELOPMENT.md](./DEVELOPMENT.md)).

### Environment (`.env.local`)

There is no `.env.example` in the repo. These are every env var the code reads (verified via
`process.env` references in `lib/`, `middleware.ts`, `scripts/`):

```bash
# Public — browser + storefront anon reads (required)
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Server / edge — the middleware tenant resolver reads SUPABASE_URL first,
# then falls back to NEXT_PUBLIC_SUPABASE_URL (lib/tenant/resolveTenant.ts)
SUPABASE_URL=https://<ref>.supabase.co

# Service role — bypasses RLS. ONLY for trusted server mutations / scripts.
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Prod: root domain for subdomain extraction (e.g. caros.com). Unset locally.
NEXT_PUBLIC_ROOT_DOMAIN=caros.com

# Apex / plain-localhost / *.vercel.app fallback tenant slug.
# Code hard-defaults to 'dealer1' if unset (lib/tenant/resolveTenant.ts).
DEFAULT_TENANT_SLUG=dealer1

# Only to run the FULL RLS proof (a real tenant-A login). Optional otherwise.
TEST_TENANT_A_EMAIL=owner@dealer1.test
TEST_TENANT_A_PASSWORD=<password>
```

### Commands (the only scripts in `package.json`)
```bash
npm install
npm run dev      # http://localhost:3000  ( / redirects to /en )
npm run build    # production build
npm run start    # serve the build
npm run lint     # next lint (eslint 9)

# RLS isolation proof — no npm script; run directly. Keep green before merging
# anything touching schema, policies, or the leads/tenant access paths.
npx tsx scripts/test-rls.ts
```

> There is **no** `npm test` and **no** `npm run test-rls`. The RLS proof runs via `npx tsx`.
> Supabase TS types (`lib/supabase/database.types.ts`) are regenerated manually with the
> Supabase CLI — see [DEVELOPMENT.md](./DEVELOPMENT.md) (Windows: UTF-8 only).

### Local multi-tenant access
- **Subdomains:** use `lvh.me` (resolves to 127.0.0.1) — `http://dealer1.lvh.me:3000`,
  `http://dealer2.lvh.me:3000`. The first host label is the tenant slug. Locally
  `NEXT_PUBLIC_ROOT_DOMAIN` is unset, so the resolver uses the legacy 2-label heuristic.
- **Apex / plain localhost:** `http://localhost:3000` falls back to `DEFAULT_TENANT_SLUG`.
- **Dashboard:** `http://localhost:3000/dashboard` — host-independent; scoped to the
  logged-in user's tenant (`my_tenant_id()`).

> The root `README.md` is **stale** — it describes the original pre-Supabase static-data
> starter ("no database, no auth, no dashboard"). This `docs/` folder is the source of truth.
