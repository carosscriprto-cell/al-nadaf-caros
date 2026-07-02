# Roadmap & Known Gaps

Grounded in actual code markers (TODO / DEPRECATED / "pending"), verified dead code, and RLS
gaps that the migration files themselves flag. Current shipped state is described in
[OVERVIEW.md](./OVERVIEW.md). Verify each item still applies before acting — code moves.

## Tech-debt / cleanups (traceable to code)

| Item | Where (verified) | Detail |
|---|---|---|
| **`car_category = 'electric'` P3 remap** | `lib/supabase/mappers.ts` (`guardCategory`), `hooks/useHeroSearch.ts:203`, `components/hero/HeroSearchPanel.tsx:197`, `20260614090000_extend_market_enums.sql` | `electric` is a legacy `car_category` value that overlaps `fuel_type`. The mapper logs it and passes it through; the hero excludes it from body-type chips. The **data migration** to remap those rows to a real category + `fuel_type='electric'` is still pending. |
| **HeroV2 placeholder hook is a stub** | `hooks/useHeroPlaceholder.ts:1` (`// TODO: HeroV2 — minimal implementation to unblock build. Revisit…`) | Minimal implementation; revisit for full HeroV2 behavior. |
| **Duplicate `useHeroPlaceholder` file** | `hooks/useHeroPlaceholder.ts` **and** `hooks/useHeroPlaceholder.tsx` both export `useHeroPlaceholder` | `HeroSearchPanel` imports `@/hooks/useHeroPlaceholder`, which TS resolves to the **`.ts`** file — the **`.tsx` is shadowed/never imported**. Confirm and delete the `.tsx`. |
| **ErrorBoundary has no monitoring hook** | `components/ErrorBoundary.tsx:26` (`// TODO: Log error to monitoring service`) | Client errors are caught but not reported anywhere. Wire a monitoring service when one exists. |
| **Stale root `README.md`** | `README.md` (self-flagged) | Describes the old static-data starter ("no database/auth/dashboard"). Superseded by `docs/`. Rewrite or delete when convenient. |

## Dead code — verified zero importers (safe-ish to remove after a final check)

Each was verified by an import search across `app/` + `components/` and has **no importer**:

| File | Note |
|---|---|
| `components/PromoBanner.tsx` | Not imported anywhere. |
| `components/ServicesPreview.tsx` | Not imported (the `FleetDetailClient` match is a `includedServicesPreview` substring, not this component). |
| `components/hero/HeroPopularSearches.tsx` | Not imported (hero uses quick-filter chips). |
| `components/hero/HeroSpotlight.tsx` | Not imported. |
| `components/hero/HeroTrustBar.tsx` | Not imported (hero uses `HeroTrustStrip`, which only mentions `HeroTrustBar` in a comment). |

> `components/HeadSection.tsx` is **NOT dead** — it's imported by `WhyChooseUs`, `HowItWorks`,
> `FeaturedCarousel`, `BrandShowcase`, and `AboutPageClient`. (The previous docs' claim about
> `HeroSectionClassic.tsx` is void — that file no longer exists in the repo.)
>
> Re-run an import search immediately before deleting any of the above.

## RLS / security gaps (by design — flagged in the migrations)

| Gap | Where | Status |
|---|---|---|
| No policies for `tenants` INSERT/DELETE, `tenant_users` UPDATE, `leads` DELETE | `20260614091000_rls_policies.sql` header | **Service-role only by design.** Revisit if dealers need self-serve user management / lead deletion. |
| `my_tenant_id()` uses `limit 1` with no `order by` | `20260614092000_harden_my_tenant_id.sql` header | Returns an **arbitrary** tenant if a user ever belongs to more than one. Safe only while each user maps to exactly one tenant. A real fix needs an explicit active-tenant context (JWT claim / session GUC), not `limit 1`. Keep this in mind before enabling multi-tenant membership. |

## Deferred product work (per code comments)

| Item | Trace |
|---|---|
| **Hard plan enforcement / billing** | `lib/tenant/plans.ts` — presets are onboarding defaults, "hard enforcement is deferred to V3 billing." `tenants.features` stays the runtime authority; only Layer-2 `maxCars`/`maxImagesPerCar` guards exist today (`dashboard/cars/actions.ts`). |
| **VIP delivery / chauffeur flow** | `enableVipDelivery` flag exists (`lib/tenant/features.ts`, enterprise preset) and `VipDeliveryBadge` renders when a car has `deliveryAvailable`, but there is no full delivery/booking-wizard flow behind the flag. |

## Guiding rules when picking up roadmap work
- Migrations: idempotent, header-documented, applied via the SQL editor (no `db push`). See
  [DEVELOPMENT.md](./DEVELOPMENT.md).
- Anything touching tenant-data isolation must keep `npx tsx scripts/test-rls.ts` green and add
  assertions if it introduces a new access path.
- Prefer per-tenant config (DB + providers) over static config for anything that varies by
  dealer.
