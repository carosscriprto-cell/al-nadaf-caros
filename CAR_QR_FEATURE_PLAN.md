# Car QR Codes — Implementation Plan (Claude Code Prompts)

Feature: per-car QR codes for showroom printing. Enterprise preset, flag-gated
(`enableCarQr`), delivered as a **sidebar tool** (`/dashboard/qr`) — not embedded in
the cars table. QR encodes a stable short link `/c/{car_id}` that redirects to the
current fleet detail page, so printed codes survive slug changes.

**Rules for every task:** run each prompt in a fresh Claude Code session. Each task is
self-contained and small. After each task: `npm run build` must pass. Never touch
`supabase/migrations/` — no schema change is needed (features is jsonb)
use skills for from .agents/skills
---

## Task 0 — Install dependency --done

```
Install qrcode.react in this Next.js project:
npm install qrcode.react
Do nothing else. Confirm it appears in package.json dependencies.
```

---

## Task 1 — Feature flag `enableCarQr`

```
Add a new tenant feature flag `enableCarQr` to this multi-tenant Next.js app.

1. In lib/tenant/features.ts:
   - Add `enableCarQr: boolean` to the TenantFeatures type.
   - Add `enableCarQr: false` to DEFAULT_FEATURES.
   - Make sure parseTenantFeatures picks it up the same way as the other
     enable* booleans (follow the existing pattern exactly).

2. In lib/tenant/plans.ts (getPlanFeatures presets):
   - starter: enableCarQr: false
   - pro: enableCarQr: false
   - enterprise: enableCarQr: true

Do NOT create a migration — tenants.features is jsonb and the parser must
default missing keys to false. Do not touch any other file.
Verify with: npm run build.
```

---

## Task 2 — Stable public redirect route `/c/[carId]`

```
Create a public short-link route for QR codes in this Next.js 15 App Router app.

New file: app/(site)/c/[carId]/route.ts (a Route Handler, GET).

Behavior:
- Read the tenant id from the `x-tenant-id` request header (set by middleware.ts).
  If missing → return 404.
- Validate carId is a UUID; if not → 404.
- Query Supabase with createPublicServerClient() from lib/supabase/client.ts
  (anon client, RLS enforced): select `slug` from `cars` where
  id = carId AND tenant_id = tenantId AND available = true. Single row.
- If no row → 404 (a sold/removed car must dead-end, not leak).
- If found → 302 redirect to `/ar/fleet/{slug}` on the SAME origin
  (relative redirect via new URL(`/ar/fleet/${slug}`, request.url)).

Constraints:
- Do NOT use the service-role client. Do NOT chain .select() patterns that
  differ from existing storefront queries — mirror the style used in
  lib/supabase/queries.server.ts.
- Check middleware.ts matcher: /c/... must pass through the storefront
  tenant-resolution branch (it should already, since it is not /dashboard
  or /auth and not a static asset). If it would be excluded, fix the matcher
  minimally and explain why.

Verify: npm run build. Then confirm manually in your summary how
http://dealer1.lvh.me:3000/c/<some-car-uuid> would resolve.
```

---

## Task 3 — `tenantPublicOrigin` helper

```
Create lib/tenant/publicOrigin.ts exporting one pure function:

export function tenantPublicOrigin(t: {
  domain: string | null;
  subdomain: string | null;
  slug: string;
}): string

Logic:
1. If t.domain is set → `https://${t.domain}` (the exact stored host).
2. Else if process.env.NEXT_PUBLIC_ROOT_DOMAIN is set →
   `https://${t.subdomain ?? t.slug}.${root}`.
3. Else (local dev) → `http://${t.slug}.lvh.me:3000`.

Trim/lowercase the root domain env like lib/tenant/resolveTenant.ts does.
Add a short JSDoc explaining this mirrors the resolution order in
resolveTenant.ts (domain → subdomain → slug). No other files. npm run build.
```

---

## Task 4 — Sidebar entry + gated page shell

```
Add a new dashboard tool page "QR Codes" to this app, gated by the
enableCarQr tenant feature flag.

1. Find the dashboard sidebar/nav component under components/dashboard/
   (the one rendering links to /dashboard/cars, /dashboard/leads, etc.).
   Add a "QR Codes" item linking to /dashboard/qr with a QrCode icon from
   lucide-react. Render it ONLY when the tenant's features.enableCarQr is
   true — follow the exact same pattern the sidebar/dashboard already uses
   to read tenant features (find how it gates other items; if nothing is
   gated yet, read features the same way the dashboard layout or settings
   page loads the tenant row).

2. New route: app/(system)/dashboard/qr/page.tsx (Server Component).
   - Load the logged-in user's tenant row via createSupabaseServerClient()
     (lib/supabase/server.ts), same as other dashboard pages do.
   - Parse features; if enableCarQr is false → notFound().
   - Fetch the tenant's cars: id, slug, brand, model, year, thumbnail,
     status, available — RLS scopes it, order created_at desc.
   - Compute the public origin with tenantPublicOrigin() from
     lib/tenant/publicOrigin.ts.
   - Render a client component <QrToolClient cars={...} origin={...}
     tenantName={...} logoUrl={...} /> (create a stub client component that
     just lists the cars for now — the real UI is the next task).

Bilingual labels: follow however the dashboard currently does its AR/EN
strings (caros_dash_lang cookie pattern) — copy the existing approach, do
not invent a new i18n mechanism. npm run build must pass.
```

---

## Task 5 — QR tool UI (picker + preview + downloads + print)

```
Implement the client UI for app/(system)/dashboard/qr (replace the stub
QrToolClient). Use qrcode.react (already installed). Follow the existing
dashboard component style (Tailwind v4 tokens, Radix primitives, RTL-aware).

Layout (two panes, stacks on mobile):

LEFT — car picker:
- Search input filtering by brand/model/year (client-side, simple includes).
- Scrollable list of cars: thumbnail, "{brand} {model} {year}", status badge.
- Clicking selects a car (single select).

RIGHT — QR panel for the selected car:
- QR value = `${origin}/c/${car.id}`.
- <QRCodeSVG value={url} size={320} level="M" /> from qrcode.react.
  If the tenant logoUrl prop is set, offer a toggle "show logo in center":
  when on, use level="H" and imageSettings={{ src: logoUrl, width: 56,
  height: 56, excavate: true }}.
- Show the short URL as selectable text with a copy button.
- Buttons:
  1. Download SVG — serialize the rendered SVG node to a Blob and download
     as `qr-{car.slug}.svg`.
  2. Download PNG — render the same value to a hidden <QRCodeCanvas> at
     size 1024 and download canvas.toDataURL('image/png') as
     `qr-{car.slug}.png`.
  3. Print — window.print() with an @media print stylesheet that hides
     everything except a centered print card: QR (large), car title, and
     the tenant name. Add the print styles scoped to this page only.

Use safeRandomUUID from lib/utils/uuid.ts if any client-side id is needed
(never crypto.randomUUID directly — project rule). No server mutations, no
new API routes. npm run build and npm run lint must pass.
```

---

## Task 6 — Verification pass

```
Verification for the Car QR feature. Do not write new features.

1. npm run build — must be green.
2. npm run lint — must be clean.
3. grep for `enableCarQr` and list every file using it; confirm:
   - features.ts type + default(false), plans.ts presets (enterprise true),
   - sidebar item gated, /dashboard/qr page notFound() when flag off.
4. Read app/(site)/c/[carId]/route.ts and confirm: anon client only,
   tenant id from x-tenant-id header only (never from query/body),
   404 on unknown/unavailable car, relative redirect.
5. Confirm middleware.ts matcher does not exclude /c/ paths.
6. Run: npx tsx scripts/test-rls.ts — must pass (feature adds no new
   authenticated access path, but keep the proof green).
Report findings as a short checklist, fix only regressions you introduced.
```

---

## Manual test script (you, not the agent)

```sql
-- enable for a non-enterprise test tenant:
update public.tenants
set features = features || '{"enableCarQr": true}'::jsonb
where slug = 'dealer2';
```

1. Login as dealer2 owner → sidebar shows "QR Codes" → `/dashboard/qr`.
2. Select a car → QR renders → scan with a phone on the same network
   (or open the encoded URL): `http://dealer2.lvh.me:3000/c/{id}` → 302 →
   `/ar/fleet/{slug}`.
3. Set the car `available = false` → the same short link now 404s.
4. Flip the flag off → sidebar item gone, `/dashboard/qr` → 404.
5. Download SVG + PNG, and Print preview shows only the print card.

## Deferred (do NOT build now)

- Scan analytics (counter on `/c/{id}`) — the stable link makes this a
  drop-in later, zero reprints.
- Batch print sheet (multi-select → A4 grid of QR cards).
- Dashboard car detail page — separate feature, unrelated scope.
