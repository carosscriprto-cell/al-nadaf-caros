# Caros — Project Overview

> Entry point for developers and AI agents. Read this first, then [ARCHITECTURE.md](./ARCHITECTURE.md) for how it works, [ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md) to add a dealer, [DEVELOPMENT.md](./DEVELOPMENT.md) to work on the code, and [ROADMAP.md](./ROADMAP.md) for what's next.

## What Caros is

Caros is a **multi-tenant SaaS** that gives car **dealerships and rental agencies** a polished, **bilingual (Arabic / English, RTL-aware)** storefront **plus** a self-service dashboard — from one codebase, one deployment, one database.

It is **lead-based, not e-commerce.** There is no cart, no checkout, no online payment. Every storefront converts a visitor into a **lead**: a row persisted to the database, optionally followed by a **WhatsApp** deep-link to the dealer's number. Dealers manage inventory, branding, and leads from the dashboard.

Each dealer ("tenant") is a **row in the `tenants` table** — *not* a separate build, folder, or deploy. Tenants are resolved at runtime from the request host (subdomain or custom domain) and isolated by `tenant_id` + Postgres Row-Level Security (RLS).

## Current status — V2.5

Built and working (phases P1–P6 + the P2.5 white-label sub-phases, per `carosv2.md`):

| Area | What exists |
|---|---|
| **Multi-tenancy** | Host → tenant resolution (subdomain / custom domain), `x-tenant-id` propagation, per-request cached tenant config |
| **Storefront** | Bilingual home (configurable sections), fleet listing + filters, vehicle detail, rental/sale/booking/contact/about/faq/services/financing/legal pages, client-side fuzzy search (Fuse.js) |
| **Dashboard** | Auth (Supabase), inventory CRUD (`/dashboard/cars`), leads inbox (`/dashboard/leads`), settings (`/dashboard/settings`), site/white-label editor (`/dashboard/site`) |
| **Leads** | Public write-only capture (DB first) → optional WhatsApp; typed leads (inquiry / booking / purchase / availability / viewing); booking window fields |
| **White-label** | Per-tenant colors (injected as CSS vars), logo/favicon/OG, SEO, contact, social, map, home **section** order/visibility, optional **pages**/buttons, editable **content** (bilingual) |
| **Plans & gating** | `starter` / `pro` / `enterprise` presets → feature flags that gate storefront + dashboard behavior |
| **Security** | RLS isolation on every tenant table; `scripts/test-rls.ts` proves cross-tenant denial |
| **SEO** | `app/sitemap.xml`, `app/robots.txt`, per-tenant metadata + Organization JSON-LD |

**Deferred to later versions** (see [ROADMAP.md](./ROADMAP.md)): V3 self-signup + billing (and *hard* plan enforcement), delivery/chauffeur with a booking-wizard rework, VIP service, internal chat, multi-branch, AI promo-post generation. Pending cleanups: the `car_category = 'electric'` → real-category + `fuel_type` remap (P3), and dead code (`HeroPopularSearches`, `HeroSectionClassic`, `PromoBanner` if unused).

> ⚠️ The root `README.md` is the **old static-starter** description (pre-Supabase: "no database, no auth, no dashboard"). It is stale — this `docs/` folder describes the actual V2.5 system.

## Tech stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first `@theme` tokens in `app/globals.css`) · **next-themes** (light/dark) · **Radix UI** primitives
- **next-intl** (ar/en, RTL) · **Framer Motion** · **Fuse.js** (search) · **React Hook Form + Zod** · **React Leaflet** (map)
- **Supabase**: Auth + Postgres + Storage + **RLS**. Access via `@supabase/ssr` (cookie sessions) and `@supabase/supabase-js`.

## Quick start

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (URL + anon key + service-role key)

### Environment (`.env.local`)
```bash
# Public (browser + storefront anon reads)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Server-only (service role bypasses RLS — never expose to the client)
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Local dev: render a tenant on plain localhost / apex (no subdomain).
# Set to an existing tenant slug.
DEFAULT_TENANT_SLUG=dealer1

# Only needed to run the FULL RLS proof (a real tenant-A login)
TEST_TENANT_A_EMAIL=owner@dealer1.test
TEST_TENANT_A_PASSWORD=<password>
```

### Commands
```bash
npm install
npm run dev      # http://localhost:3000  (/ redirects to /en)
npm run build    # production build
npm run start    # serve the build
npm run lint     # eslint

# RLS isolation proof — must stay green before merging schema/policy changes
npx tsx scripts/test-rls.ts
```

> There is **no** `npm test` / `npm run test-rls` script — run the RLS proof directly with `npx tsx`. Supabase TS types are regenerated manually with the Supabase CLI (see [DEVELOPMENT.md](./DEVELOPMENT.md)).

### Local multi-tenant access
- **Subdomains:** use `lvh.me` (resolves to 127.0.0.1) — e.g. `http://dealer1.lvh.me:3000`, `http://dealer2.lvh.me:3000`. The first label is the tenant slug.
- **Apex / plain localhost:** `http://localhost:3000` falls back to `DEFAULT_TENANT_SLUG`.
- **Dashboard:** `http://localhost:3000/dashboard` (host-independent; scoped to the logged-in user's tenant).
