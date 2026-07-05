# Caros V3 — Plan & Decisions

**Epoch:** Entitlement + Operator. **Constraint:** no payment gateway in Syria yet (Visa TBD).
**Core principle:** build all of V3 now — entitlement decoupled from payment; manual activation
today, Stripe webhook later swaps only the trigger.

---

## 0. Versioning scheme (decided)

Three independent counters — do not share a namespace.

| Counter | Meaning | Lives in |
|---|---|---|
| **P-number** (P1…P8, next P9…) | schema/migration phase | `supabase/migrations/` headers |
| **SF-version** (SF-v2.5 → …) | storefront product epoch | `config/versions.ts` (to add) |
| **DB-version** (DB-v2 → DB-v3) | dashboard product epoch | `config/versions.ts` (to add) |

- Storefront and dashboard version **independently** (separate route groups already).
- Current state: SF ≈ v2.5, DB ≈ v2.0. The new tooling epoch is **DB-v3.0**.
- Priority now = **dashboard-first**. Storefront is mature; dashboard is new/under-polished.

---

## 1. V2.6 — hardening (build now, market-independent)

No new product surface. Useful in every future. Mergeable behind green `test-rls.ts`.

| Item | Trace |
|---|---|
| P9: drop `monthly_installment` orphan | backfill → idempotent `DROP COLUMN IF EXISTS` |
| P3: remap `car_category='electric'` | data migration → real category + `fuel_type='electric'` |
| Finish `useHeroPlaceholder` stub + delete shadowed `.tsx` | `hooks/` |
| Filter consolidation | `useVehicleFilters`/`lib/vehicles/filters` → live page, or delete |
| Dead-code sweep (post final import-search) | `PromoBanner`, `ServicesPreview`, `HeroPopularSearches`, `HeroSpotlight`, `HeroTrustBar` |
| ErrorBoundary → real monitoring hook | `components/ErrorBoundary.tsx:26` |

**Recommended order:** P9 → dead-code → P3 → filter consolidation.

---

## 2. V3 core architecture — Billing/Entitlement split (decided)

```
Entitlement layer (build now)     ← who owns what, expiry, access state
        ⇅  (manual gap, temporary)
Payment layer (deferred → Visa)   ← how it's paid
```

- **Entitlement = the real V3.** Payment is just the activation trigger.
- Today the trigger is a **manual admin button**. Later it's a **Stripe webhook** — same function, different caller.
- Nothing in the entitlement/access/onboarding layers changes when Stripe is added.

---

## 3. Onboarding model (decided): merged self-signup + manual approval

Do not choose between "self-signup" and "contact-us manual". Merge:

- Dealer fills `/register` → tenant created `active=false`, subscription `trialing` **pending your approval**.
- **You** approve via one button in the Operator Console → 14-day trial starts.
- Trial ends without payment → `suspended` → you contact → manual payment → button extends plan.

Result: scalability of self-signup + control of manual, **without admin drudgery** (every op is one button).

**Trial length: 14 days.** Enough to load ~20 cars + see first leads + generate QR/posts →
value proven before payment ask. Value proven by *leads arriving + content generated*, not time alone.

---

## 4. Data model

### Prerequisite migration — P10: active-tenant context (do first)

`my_tenant_id()` uses `limit 1` with no `order by` → breaks under self-signup / multi-tenant membership.
**Do not ship self-signup on the bare `limit 1`.**

```sql
create or replace function public.my_tenant_id()
returns uuid language sql security definer set search_path = '' as $$
  select tenant_id from public.tenant_users
  where user_id = auth.uid()
  order by is_active desc, created_at asc   -- deterministic, not arbitrary
  limit 1
$$;
```

Full fix (JWT claim / session GUC) only when real multi-tenant membership lands. Deterministic order is the V3 floor.

### P11 — subscriptions + tool_usage

```sql
create type subscription_status as enum
  ('trialing', 'active', 'past_due', 'suspended', 'cancelled');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan tenant_plan not null default 'starter',
  status subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  activated_by uuid references auth.users(id),   -- who activated (you, today)
  payment_ref text,                              -- manual payment reference
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id)
);

create table public.tool_usage (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  tool text not null,              -- 'social_post' | 'video' | 'qr'
  period_month text not null,      -- '2026-07'
  count int not null default 0,
  primary key (tenant_id, tool, period_month)
);
```

**Decision:** `subscriptions` (access — is the account live) is separate from `tenants.features`
(capabilities — what it can do). Prevents jsonb complexity; `features` stays runtime authority for capabilities.

### P12 — platform_admins (operator identity, outside tenant model)

```sql
create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'operator' check (role in ('operator', 'super_admin')),
  created_at timestamptz default now()
);

create or replace function public.is_platform_admin()
returns boolean language sql security definer set search_path = '' as $$
  select exists(select 1 from public.platform_admins where user_id = auth.uid())
$$;
```

---

## 5. Access gating (single source of truth)

```ts
// lib/tenant/access.ts
export type AccessState = 'trialing' | 'active' | 'suspended';

export function resolveAccess(sub: Subscription): {
  state: AccessState; daysLeft: number; canWrite: boolean; storefrontLive: boolean;
} {
  const now = Date.now();
  if (sub.status === 'active' && +new Date(sub.current_period_end) > now)
    return { state: 'active', daysLeft: days(sub.current_period_end), canWrite: true, storefrontLive: true };
  if (sub.status === 'trialing' && +new Date(sub.trial_ends_at) > now)
    return { state: 'trialing', daysLeft: days(sub.trial_ends_at), canWrite: true, storefrontLive: true };
  return { state: 'suspended', daysLeft: 0, canWrite: false, storefrontLive: false };
}
```

**On trial/period expiry (decided):**
- **Never delete data.** `suspended` → storefront shows a "paused/coming soon" page (not 404),
  dashboard becomes read-only.
- Manual activation → `storefrontLive` instantly. Zero re-entry.
- Turns expiry into soft conversion pressure, not data loss.

---

## 6. Operator Console — third route group (decided)

```
app/
  (site)/[locale]/…     storefront    → scoped by HOST
  (system)/dashboard/…  tenant dash   → scoped by my_tenant_id()
  (admin)/…             operator      → scoped by is_platform_admin(), NO tenant   ← new
```

Separate authorization model from the dealer dashboard — merging them mixes two models = leak risk.

| Dimension | Tenant Dashboard | Operator Console |
|---|---|---|
| Scope | one tenant (`my_tenant_id`) | all tenants |
| Client | user cookie, RLS as user | service-role behind admin gate |
| Auth model | `tenant_users.role` | `platform_admins.role` |
| Path | `/dashboard` | `/admin` (hidden, `notFound()` for unauthorized) |

**Guard pattern:**
```ts
// lib/admin/guard.ts
export async function requirePlatformAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data } = await supabase.rpc('is_platform_admin');
  if (!data) notFound();          // hide existence, not 403
  return user;
}
```
After the gate, actions use `createServerClient()` (service role) to write across tenants.
Two layers: `is_platform_admin()` gate + service-role only behind it.

### Operator actions (all buttons, zero manual SQL)

```ts
// lib/admin/actions.ts — 'use server', requirePlatformAdmin() first
approveTenant(tenantId)                              // active=true, trial+14d, trialing
suspendTenant(tenantId)                              // suspended → storefront offline, dash read-only
activatePlan(tenantId, plan, months, paymentRef)     // active, period_end=now+months
extendPeriod(tenantId, days)                          // manual goodwill / late payment
changePlan(tenantId, plan)                            // upgrade/downgrade → updates features preset
```

`activatePlan` = the exact function the future Stripe webhook calls. Button today, webhook tomorrow.

### Console scope (V3.0)

```
(admin)/
  ├─ tenants        list / pending / [id] → approve, suspend, extend, change plan, edit features
  ├─ subscriptions  activate, extend, record payment_ref, expiring-soon queue
  ├─ usage          tool_usage across tenants → cost + upsell tracking
  ├─ leads          (read-only) volume/tenant → client-health signal
  └─ operators      manage platform_admins (super_admin only)
```

**Operator metrics that drive decisions:**

| Metric | Source | Decision |
|---|---|---|
| Trials expiring ≤3 days | `subscriptions.trial_ends_at` | who to contact for payment now |
| Leads/tenant (last 14d) | `leads` count | seeing value → pays, or silent → churns |
| tool_usage/tenant | `tool_usage` | your cost (video esp.) + upsell candidates |

---

## 7. Dashboard tools (DB-v3.0)

### QR generator — zero cost, ship first
- Button in `/dashboard/cars` → QR → `https://<host>/{locale}/fleet/{id}` → `FleetDetailPage`.
- **On-demand generation, no storage.** Deterministic URL.
- **QR points to `id`, redirect → current slug** (survives slug edits; printed sheets don't break).
- Print via `@media print` (QR + model + price + tenant logo). No PDF backend.
- Lib: `qrcode`. Cost: **zero** (no external API, no storage).

### Social post generator — free trial + paid, gated

**Part A — caption (LLM):** hook + specs + CTA + hashtags, bilingual. ~fractions of a cent/post. Negligible.

**Part B — image (decided: B1 only to start):**

| Level | Mechanism | Cost/image | Note |
|---|---|---|---|
| **B1 template overlay** | real car image + design layer (`@vercel/og`/`satori`) | **zero** | ship this |
| B2 AI bg replace | remove/replace background | ~$0.02–0.05 | future upsell |
| B3 full AI gen | model generates scene | ~$0.04–0.08+ | **risks faking the actual car** — avoid |

B1: zero variable cost, doesn't fabricate the car, matches white-label. Dealer already uploaded real photos — use them.

### Video (Remotion) — Tier 2, after tools prove demand
- 5+ images/car → Ken Burns + overlays + branding → Reels/TikTok. Higher conversion than static.
- **Render on Remotion Lambda, not Vercel** (serverless 60s timeout; render is heavy).
- Cost: **~$0.01–0.03/video** (AWS Lambda compute) → real variable cost → paid tier only.
- **Remotion commercial license**: verify current terms before commercial build (may be a fixed annual cost).
- Don't build the video pipeline before a dealer (or Al-Nadaf) actually requests visual content.

### Tooling cost summary
- Static image + caption path: variable cost ≈ LLM only = negligible → free-trial-then-paid is profitable with zero operational risk.
- Only real variable cost is Remotion video (cents/video) + AWS setup + license → gate behind paid Tier 2.

### Analytics (dealer-facing, high perceived value)
leads/day, lead source, conversion rate, most-viewed cars, QR scans/car.
Data mostly exists in `leads`; add lightweight `car_views` / QR-scan counter. No external cost.

---

## 8. Payment layer (deferred, pre-designed)

Today (manual):
```
trial ends → suspended → contact → payment (transfer/cash) →
  record payment_ref → "Activate plan" button → active, period_end=now+30d
```

Later (Visa/Stripe): replace the button with a webhook calling the **same** `activatePlan(...)`.
Layers 1–7 unchanged.

---

## 9. Execution sequence

```
V2.6 (parallel, independent):  P9 → dead-code → P3 → filter consolidation

V3 (entitlement + operator, build now — no Visa wait):
  1. P10  active-tenant context fix            [prerequisite, first]
  2. P11 + P12  subscriptions, tool_usage, platform_admins
  3. requirePlatformAdmin() + (admin) route group
  4. Operator: tenants tab (approve/suspend)   [replaces manual DB inserts]
  5. Operator: subscriptions tab (activate/extend/record-payment)  [= future Stripe webhook]
  6. access gating (trialing/active/suspended) + suspended states
  7. /register self-signup (pending flow) on top
  8. QR → analytics → social (caption + B1 image) + tool_usage quota
  9. Tier 2: Remotion video (Lambda)           [on demand signal]
  10. Payment: swap activation button → Stripe webhook  [on Visa]
```

**Market gate for tools/billing intensity:** Al-Nadaf converting leads + one more paying dealer.
Hardening (V2.6) and entitlement/operator infra (steps 1–7) proceed regardless.
