# Deployment — Vercel, Domains, Env

How to run Caros on the internet (Vercel + Supabase), and how each new tenant becomes
reachable by subdomain or custom domain. Picks up where [ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md)
(the DB runbook) leaves off. Resolution logic lives in `middleware.ts` +
`lib/tenant/resolveTenant.ts` — see [ARCHITECTURE.md](./ARCHITECTURE.md) §1.

## How a host resolves to a tenant (recap)

Every request → `middleware.ts` → `resolveTenantId(host)`:

1. **Subdomain → `slug`** — the first host label (after stripping `NEXT_PUBLIC_ROOT_DOMAIN`) →
   `get_tenant_id_by_slug`. `premier.caros.com` → `premier`.
2. **Full host → `domain`/`subdomain`** — custom domains → `get_tenant_id_by_domain` (matches
   the `domain` **or** `subdomain` column on the full host).
3. **`DEFAULT_TENANT_SLUG`** — fallback for apex / localhost / `*.vercel.app` only. Code
   hard-defaults to `dealer1` if the env is unset.

Key behaviors from the code:
- **`*.vercel.app` is never a tenant subdomain.** Any host ending in `.vercel.app` returns
  `null` from `extractSubdomain` → falls to `DEFAULT_TENANT_SLUG`. Don't use a Vercel project
  name as a tenant slug.
- **An unknown subdomain is a hard 404, not a silent default.** `bogus.caros.com` does not
  serve `dealer1`'s data — it tries a custom-domain match, then 404s (tenant isolation).
- **`slug` / `subdomain` / `domain` are all unique**, and resolution only returns
  `active = true` tenants.

## The single most important prod env var: `NEXT_PUBLIC_ROOT_DOMAIN`

Subdomain extraction depends on it (`lib/tenant/resolveTenant.ts`):

| `NEXT_PUBLIC_ROOT_DOMAIN` | Behavior |
|---|---|
| **Set** (e.g. `caros.com`) | subdomain = host minus `.caros.com` (any label depth). `caros.com` and `www.caros.com` → no subdomain (apex / domain match). |
| **Unset** | legacy heuristic: last **2** labels are the base domain (enough for `dealer1.lvh.me` locally). Wrong for a real multi-label prod domain. |

> **Always set `NEXT_PUBLIC_ROOT_DOMAIN` in production** to your root domain (no `www`, no
> protocol). Without it, a real subdomain won't be extracted correctly and will fall back to
> the default tenant. After changing any Vercel env var, **Redeploy** — Vercel only picks up
> env changes on a new deployment.

## Step 0 — one-time platform setup

1. **Vercel env vars** (Project → Settings → Environment Variables, Production + Preview):

   | Var | Value | Note |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | |
   | `SUPABASE_URL` | same URL | the edge resolver reads this first |
   | `SUPABASE_SERVICE_ROLE_KEY` | service role | trusted server mutations only |
   | **`NEXT_PUBLIC_ROOT_DOMAIN`** | `caros.com` | critical — enables subdomain extraction |
   | `DEFAULT_TENANT_SLUG` | (optional) slug shown on apex / `*.vercel.app` | defaults to `dealer1` |

2. **Wildcard subdomain on Vercel** (Project → Settings → Domains): add `caros.com`,
   `www.caros.com`, and **`*.caros.com`** — the wildcard makes any `<slug>.caros.com` reach the
   app without adding each subdomain by hand.

3. **DNS for the root domain** (at your DNS provider for `caros.com`):
   - `A` / `ALIAS` for the apex → as Vercel instructs.
   - `CNAME` for `www` → `cname.vercel-dns.com`.
   - `CNAME` for `*` (wildcard) → `cname.vercel-dns.com`.

   After this, **a new subdomain tenant needs no DNS or Vercel work** — just a `tenants` row.

4. **Supabase**: apply all `supabase/migrations/` in order via the SQL editor (see
   [DEVELOPMENT.md](./DEVELOPMENT.md)); create the public **`car-images`** storage bucket (the
   storage RLS in `20260616130000_p5a_storage_car_images.sql` governs it).

## Step 1 — create the tenant

Follow [ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md) Steps 1–3 (auth user → `tenants`
insert → `tenant_users` link). For subdomain-only launch, set `slug` (and usually
`subdomain = slug`), leave `domain` NULL.

## Step 2 — the subdomain works immediately

With the row `active = true`, `https://<slug>.caros.com` works right away — the `*.caros.com`
wildcard + `NEXT_PUBLIC_ROOT_DOMAIN=caros.com` let the middleware extract the slug and match it.
No extra DNS or Vercel config.

```bash
curl -I https://premier.caros.com   # 200 = resolved, 404 = no active tenant matched
```

If you get a 404: confirm `slug` matches, `active = true`, and `NEXT_PUBLIC_ROOT_DOMAIN` is set
— then redeploy.

## Step 3 — (optional) a tenant's own custom domain

When a tenant wants `premiermotors.ae` instead of the subdomain:

**3a. Vercel** — Project → Settings → Domains → add `premiermotors.ae` and
`www.premiermotors.ae`. Vercel shows the DNS records to set.

**3b. DNS at the tenant's provider** (owner of `premiermotors.ae`):
- `A` for the apex → the IP Vercel gives.
- `CNAME` for `www` → `cname.vercel-dns.com`.

This host is **outside** `NEXT_PUBLIC_ROOT_DOMAIN`, so `extractSubdomain` returns `null` and
resolution happens on the **full host** via `get_tenant_id_by_domain`.

**3c. Store the exact host in the `tenants` row:**

```sql
update public.tenants
set domain = 'www.premiermotors.ae'   -- store EXACTLY the host that arrives in the Host header
where slug = 'premier';
```

- Store precisely the host that reaches the app. If the apex redirects to `www`, the arriving
  host is `www.premiermotors.ae` — store that.
- To cover both apex and `www`, set the apex to redirect → `www` on Vercel, so only one host
  reaches the app.
- `domain` is unique — it can't be shared between tenants.

```bash
curl -I https://www.premiermotors.ae   # 200 = custom domain resolves to the tenant
```

The tenant is then reachable via **both** `premier.caros.com` and `www.premiermotors.ae`.

## Local sanity check

`lvh.me` always resolves to `127.0.0.1` (no hosts-file edits needed). Locally
`NEXT_PUBLIC_ROOT_DOMAIN` is unset, so the legacy 2-label heuristic extracts `premier` from
`premier.lvh.me`:

```bash
npm run dev
# http://premier.lvh.me:3000   → subdomain → slug=premier
# http://localhost:3000        → apex → DEFAULT_TENANT_SLUG
```

## Image optimization note (`next.config.ts`)

The Next image optimizer is configured to allow: `basemaps.cartocdn.com` (map tiles),
`*.supabase.co/storage/v1/object/public/**` (car images), and **any https host** (`**`) — so a
dealer can set an external logo / favicon / OG image URL. That last pattern intentionally lets
the optimizer fetch arbitrary https hosts on demand (accepted tradeoff for tenant-provided
brand assets).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Subdomain gives **404** | wrong `slug`, `active=false`, or `NEXT_PUBLIC_ROOT_DOMAIN` unset/wrong | match slug, set `active=true`, set the env, **redeploy** |
| Subdomain shows the **default tenant** | `NEXT_PUBLIC_ROOT_DOMAIN` unset → host treated as apex/`*.vercel.app` | set `NEXT_PUBLIC_ROOT_DOMAIN` = your root domain, redeploy |
| `*.vercel.app` URL shows the default tenant | expected — `.vercel.app` is never a tenant subdomain | test via your real `*.caros.com` domain |
| Custom domain **404** despite correct DNS | `domain` column ≠ the arriving host (apex vs `www`) | store the exact host; unify via apex→www redirect |
| Env changes don't take effect | Vercel only reads env on a new deploy | **Redeploy** after each env change |
| `tenants` edit doesn't appear immediately | PostgREST schema cache | `NOTIFY pgrst, 'reload schema';` |

## Quick decision matrix

| You want… | Do |
|---|---|
| New tenant on a **subdomain** `x.caros.com` | one `tenants` row: `slug='x'`, `active=true` — the wildcard covers it |
| Add a **custom domain** to a tenant | Vercel domains + DNS at the owner + `update tenants set domain=...` |
| **Sale-only** dealer | `enableSellCar:true, enableRental:false` |
| **Rental-only** agency | `enableSellCar:false, enableRental:true` |
| **Hybrid** (sale + rent) | both `true` |
