# Caros V2 — Execution Plan & Claude Code Prompts

> **Goal of V2:** multi-tenant runtime + white-label + server-only data + advanced dashboard + clean core.
> **Rule:** one phase = one prompt = one git branch = one PR = review before next. Never run the next prompt before closing the current (build green + reviewed + committed). This prevents project entanglement.
> **How to use:** Open the full project root in VS Code. Run each prompt on its own branch. Review the report. Merge. Only then move to the next phase.

---

## Phase Map

```
P1  Cleanup            ← remove dead code, fix broken imports, isolate dashboard
P2  Schema Foundation  ← reconcile enums, generate types, version-control schema, RLS
P3  Data Unification   ← wipe stale data, seed fresh, delete static, unify fetching
P4  Multi-tenant       ← domain/subdomain resolution + theming from DB
P5  Adv. Dashboard     ← inventory CRUD + leads/bookings persistence
P6  White-label + SEO  ← per-tenant branding + sitemap/robots/JSON-LD
```

Dependency: each phase assumes the previous one is merged. Do not reorder.

---

## Phase 1 — Project Cleanup / done

**Branch:** `chore/p1-cleanup`

```
You are a Senior Next.js engineer doing a SAFE cleanup pass on the Caros codebase. Phase 1 of a multi-phase plan. SCOPE = cleanup only: remove dead code, fix broken imports, isolate the dashboard. NO features, NO data migration, NO architecture refactor.

Rules:
- Branch chore/p1-cleanup. Small grouped commits. Run `next build` + `next lint` after each group; never proceed on a broken build.
- Do NOT delete data/cars.ts (19 files still import it) — defer to P3. Only document its usages.
- Do NOT touch queries.server.ts/mappers.ts logic beyond fixing imports.
- When unsure if something is safe to delete, FLAG it, don't delete.

Tasks (in order):
1. INVENTORY (read-only report first): files importing @/data/cars (split: static `cars` array vs `Car` type only); all commented-out code blocks (commented middleware, FeaturedCarsSection tails, getTenant.ts, fleet/[id]); broken/missing imports (@supabase/ssr absent from package.json; DashboardSidebar path mismatch app/dashboard/components vs @/components/dashboard; missing DashboardTopbar); unused deps (check next-i18next/i18next); all routes.
2. REMOVE DEAD CODE: delete clearly-dead commented blocks. Replace the 80-line commented middleware with a minimal pass-through middleware + `// TODO P4: tenant resolution + auth`. Remove unused imports/vars flagged by lint.
3. FIX IMPORTS: unify DashboardSidebar to ONE path (@/components/dashboard). Create empty placeholder DashboardTopbar `// TODO P5`. Isolate the dashboard so the PUBLIC site builds green even if dashboard is stubbed; do NOT add @supabase/ssr yet — gate dashboard behind a TODO if it blocks the build. Report exactly what you did.
4. SECTIONS (report only, no deletion): list WhyChooseUs, Testimonials, RentVsBuyBanner as "make tenant-configurable in P6". Report booking/ as "depends on static data, blocked until P3". Delete only truly orphaned components/routes with zero imports — list them first.
5. DEPS: remove confirmed-unused deps; revert any removal that breaks build.
6. FINAL REPORT: deleted / fixed / "Needs Confirmation" / "Deferred to later phases" / confirm build+lint green.

Hard limits: build green at every commit. Zero features. When in doubt, flag. Keep on branch, do not merge.
```

---

## Phase 2 — Schema Foundation (enums, types, migrations, RLS) / done

**Branch:** `chore/p2-schema-foundation`
**Prereq:** P1 merged. Requires Supabase CLI linked to the project.

```
You are a Senior Postgres/Supabase engineer. Phase 2: establish a single source of truth for schema, types, and tenant isolation. NO data migration yet, NO UI work.

Rules: branch chore/p2-schema-foundation. Run `next build` after type changes. Flag anything ambiguous instead of guessing.

Tasks (in order):
1. ENUM RECONCILIATION: compare TS domain types (types/vehicles.ts) against DB enums (database.types.ts). Document every drift: Currency (TS=USD only vs DB=USD|EUR|AED), CarCategory (TS has wagon/crossover/van/minivan/mpv/supercar absent from DB enum), CarClass, any others. Decide the CANONICAL set per enum (prefer extending the DB enum to cover real values over silently dropping). Produce a written reconciliation table BEFORE changing anything.
2. APPLY ENUM CHANGES via migration: write SQL migrations under supabase/migrations/ to align DB enums to the canonical set. Do not hand-edit the cloud only.
3. VERSION-CONTROL SCHEMA: export the current full schema into supabase/migrations/ (the repo currently has only .temp — fix this). The repo must be able to recreate the schema from scratch.
4. REGENERATE TYPES: generate TS types from the DB (Supabase CLI) into the canonical types file. Stop hand-writing domain enums that drift. Update mappers.ts so mapDbCarToCar can never return a value outside the enum; add a runtime guard + log on unknown values.
5. RLS: write/confirm RLS policies on every tenant-scoped table (cars, car_content, leads, tenant_users, tenant_pages, bookings-if-exists) using my_tenant_id(). Enable RLS on each. Ship policies as migrations.
6. RLS TEST HARNESS: add a script (scripts/test-rls.ts) that, using the ANON key, asserts tenant A cannot read/write tenant B rows. Must be runnable and pass. This is the isolation proof.
7. REPORT: reconciliation table, migrations added, policies added, harness result, confirm `next build` green.

Hard limits: no data seeding, no public-route refactor yet. Schema + types + RLS only.
```

---

## Phase 3 — Data Unification (kill static, single source)

Phase 3 — Data Unification. CRITICAL: this wipes live data, so we verify before deleting.

STEP 0 — VERIFY THE CORE ASSUMPTION FIRST (no writes, no deletes):
The plan assumes static data/cars.ts is newer and Supabase is stale. But the live DB uses 
8 car categories while static only uses sedan/suv — so the live DB may contain real cars NOT 
present in static. Before anything:
- Report: count of cars in data/cars.ts vs count in live Supabase cars table.
- List any cars in the live DB that would be DELETED but have no equivalent in static 
  (by slug or brand/model/year).
- Produce a dry-run diff: what the seed inserts vs what the wipe deletes.
- STOP and show me this report. Do NOT delete or insert anything yet.

After I approve the report, proceed:

STEP 1 — SEED SCRIPT: fix/extend scripts/migrate-to-supabase.ts to map static cars + 
cars-content (en/ar) into cars + car_content, respecting the P2 market-complete enums. 
Dry-run mode (log only) first.

STEP 2 — ELECTRIC REMAP: handle the 3 rows where category='electric' — remap them to a real 
category + set fuel_type='electric' (per the P2 flag). Don't let the seed produce category='electric'.

STEP 3 — WIPE + SEED: only after my approval. Take a safety export first (the script should 
log/save the current rows before deleting). Delete stale car rows under the target tenant, 
seed from static, verify counts. Idempotent + re-runnable.

STEP 4 — REPOINT IMPORTS: replace every @/data/cars DATA import (~19 files: booking/page.tsx, 
useHeroSearch, HeroSpotlight, HeroResultsDropdown, BrandShowcase, RentVsBuyBanner...) with the 
Supabase query layer (queries.server → mappers). Keep the `Car` TYPE import pointing only to 
types/vehicles.ts.

STEP 5 — UNIFY FETCH: all pages use server-component → query → mapper → client-component. 
No component reads static data.

STEP 6 — DELETE STATIC: remove data/cars.ts + cars-content/{en,ar}.ts. Archive the seed script 
to scripts/_archive/. Confirm zero remaining @/data/cars data imports (grep).

STEP 7 — VERIFY: build green, re-run scripts/test-rls.ts (isolation still holds), confirm the 
storefront still renders cars from Supabase.

Hard limits: no features, no dashboard, no multi-tenant runtime. Data unification only.
DO NOT execute Step 3 (wipe) until I approve the Step 0 report.
```

---

## Phase 4 — Multi-tenant Runtime + Theming

**Branch:** `feat/p4-multi-tenant`
**Prereq:** P3 merged. Single data source live.

```
You are a Senior Next.js engineer. Phase 4: turn the single-tenant runtime into true multi-tenant with per-tenant theming from DB. NO dashboard CRUD yet.

Rules: branch feat/p4-multi-tenant. Build green per step. Public routes must move OFF service-role to ANON key + RLS (rely on P2 policies).

Tasks (in order):
1. TENANT RESOLUTION: replace the static NEXT_PUBLIC_TENANT_ID with runtime resolution. Implement getTenantIdFromDomain() using headers().host: subdomain as primary (x.caros.com via get_tenant_id_by_slug), optional custom domain (get_tenant_id_by_domain). Wire into middleware (the P1 pass-through) so every public request resolves its tenant.
2. ANON + RLS FOR PUBLIC: switch all public read paths from SUPABASE_SERVICE_ROLE_KEY to the ANON key. Confirm reads still work BECAUSE of RLS, not manual .eq filters. Restrict service-role usage to scripts/admin only. Report every place changed.
3. DYNAMIC THEMING: apply tenant branding from the tenants row (color_primary/secondary/accent, logo, favicon, og_image) via CSS variables at the layout level. Remove hardcoded brand colors/logos. SEO meta (title/desc bilingual) pulled per-tenant.
4. LOCALE FIX: resolve the defaultLocale inconsistency (next-intl ar vs middleware → /en). Pick one canonical default and make middleware + config agree.
5. MULTI-TENANT TEST: create a second test tenant on a different subdomain with different branding. Verify both render their own data + theme from one deployment, with zero cross-tenant leakage (reuse scripts/test-rls.ts).
6. REPORT: resolution flow, service-role→anon changes, theming applied, two-tenant proof, build green.

Hard limits: no inventory CRUD, no billing. Runtime + theming + anon/RLS only.
```

---

## Phase 5 — Advanced Dashboard (CRUD + persistence)

**Branch:** `feat/p5-dashboard`
**Prereq:** P4 merged. Multi-tenant + anon/RLS live.

```
You are a Senior Next.js engineer. Phase 5: build the tenant dashboard — inventory CRUD and lead/booking persistence. This is the core of "advanced dashboard".

Rules: branch feat/p5-dashboard. Build green per route. Add @supabase/ssr now (it was deferred in P1) for auth-aware server client. Use Server Actions + zod (already installed, currently unused) for ALL mutations — one consistent mutation pattern, no scattered API routes. All writes are RLS-protected and tenant-scoped.

Tasks (in order):
1. AUTH + GUARD: finish Supabase Auth wiring. Re-enable real route protection in middleware for /dashboard and /auth (replacing the P1 TODO). Fix the dashboard layout session+tenant guard.
2. DASHBOARD SHELL: build DashboardTopbar (stub from P1) + working sidebar nav. Routes: /dashboard (overview), /dashboard/cars, /dashboard/leads, /dashboard/settings.
3. INVENTORY CRUD: /dashboard/cars — list + create + edit + delete + toggle available/featured. Image upload via Supabase Storage, path-prefixed {tenant_id}/cars/{car_id}/ with storage RLS. All mutations = Server Actions + zod validation.
4. LEAD/BOOKING PERSISTENCE: add a bookings table migration (if absent). Every inquiry/booking form INSERTs into DB first, THEN fires WhatsApp (DB is source of truth, WhatsApp is notification — not a replacement). Wire the currently-unused leads table write path. Build /dashboard/leads to list and manage them.
5. OVERVIEW + SETTINGS: /dashboard overview with simple counts (cars, new leads). /dashboard/settings to edit tenant fields (name, whatsapp, colors, SEO) — feeds P4 theming live.
6. FEATURE GATING: gate dashboard modules by tenant.features (sales/rental/installments). Build the gating check now even though billing isn't live — modules read features, never hardcode access.
7. REPORT: routes built, mutation pattern confirmed (Server Actions + zod everywhere), storage RLS, persistence proof (a submitted form appears in /dashboard/leads), build green.

Hard limits: no billing/Stripe, no public marketing. Dashboard + persistence only.
```

---

## Phase 6 — White-label Polish + SEO

**Branch:** `feat/p6-whitelabel-seo`
**Prereq:** P5 merged.

```
You are a Senior Next.js engineer. Phase 6: finish white-label correctness and ship SEO infrastructure for the public storefront.

Rules: branch feat/p6-whitelabel-seo. Build green per step.

Tasks (in order):
1. SECTION CONFIGURABILITY: the sections flagged in P1 (WhyChooseUs, Testimonials, RentVsBuyBanner) must be tenant-configurable from DB or hideable — NO hardcoded marketing copy in a white-label product. RentVsBuyBanner renders only when tenant.features includes both sale+rent. Testimonials hidden by default for new tenants.
2. SEO INFRA: add app/sitemap.ts (per-tenant, includes car detail URLs) + app/robots.ts. Add JSON-LD: Vehicle/Product/Offer on detail pages, LocalBusiness on home. Add hreflang to listing pages (currently only on detail).
3. PERF: add pagination to getAllCarsForSearch (no full-table fetch per request). Add revalidate/ISR on listings + detail. generateStaticParams for car pages. Confirm next/image everywhere (no raw img / external unbounded sources).
4. VALIDATE: sitemap.xml resolves; JSON-LD passes Google Rich Results Test; LCP target < 2.5s on listings.
5. REPORT: sections made configurable, SEO artifacts added, perf changes, build green.

Hard limits: SEO + white-label polish only.
```

---

## After V2

Growth phase (separate, later — not part of V2): Stripe billing + plan enforcement, availability calendar + reservations (rental module), analytics, Scripto super-admin, notifications. The feature-gating built in P5 makes flipping billing on a small change.