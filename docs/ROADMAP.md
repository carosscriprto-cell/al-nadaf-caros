# Roadmap & Deferred Work

What's intentionally **not** built yet, and the known cleanups. Current shipped state is **V2.5** — see [OVERVIEW.md](./OVERVIEW.md).

## Deferred features (future versions)

| Item | Notes |
|---|---|
| **V3 self-signup + billing** | Replace manual onboarding (see [ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md)) with self-serve signup, plan checkout, and **hard plan enforcement** (today `tenants.features` can exceed the plan — `lib/tenant/plans.ts` presets are onboarding defaults, not runtime limits). |
| **Delivery / chauffeur** | Requires reworking the booking wizard (currently a lightweight "book by date" entry). `enableVipDelivery` exists as a flag but the full flow is deferred. |
| **VIP service** | Premium concierge/service tier beyond the VIP-delivery flag. |
| **Internal chat** | In-app dealer ↔ customer messaging (today conversion is lead capture + WhatsApp). |
| **Multi-branch** | Multiple locations/branches per tenant (today one tenant ≈ one storefront identity). |
| **AI promo-post generation** | Auto-generate marketing/social posts from inventory. |

## Pending cleanups (tech debt)

| Item | Detail |
|---|---|
| **`car_category = 'electric'` remap (P3)** | `electric` is a legacy value in the `car_category` enum that overlaps `fuel_type`. App code already excludes it where it would surface as a body type (e.g. hero body-type chips), but the **data migration** to remap those rows to a real category + `fuel_type='electric'` is still pending. Tracked in `lib/supabase/mappers.ts` (`guardCategory`) and `extend_market_enums` migration notes. |
| **Dead code review** | Confirm-then-remove if unused: `components/hero/HeroPopularSearches.tsx` (replaced by quick-filter chips), `components/hero/HeroSectionClassic.tsx` (kept as a hero redesign backup), and `PromoBanner`. Verify zero imports before deleting. |
| **Stale root `README.md`** | Describes the old static-data starter ("no database/auth/dashboard"). Superseded by `docs/`; rewrite or replace when convenient. |
| **RLS policy gaps (by design, confirm intent)** | No policies for `tenants` INSERT/DELETE, `tenant_users` UPDATE, `leads` DELETE — service-role only today (noted in `rls_policies.sql`). Revisit if dealers need self-serve user management / lead deletion. |

## Guiding rules when picking up roadmap work
- One phase = one branch = one PR; keep the build and `scripts/test-rls.ts` green (see [DEVELOPMENT.md](./DEVELOPMENT.md)).
- Anything that touches tenant data isolation must keep the RLS proof green and add assertions if it introduces a new access path.
- Prefer per-tenant config (DB + providers) over static config for anything that varies by dealer.
