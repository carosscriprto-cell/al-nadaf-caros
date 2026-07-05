# CLAUDE.md

Caros is a **multi-tenant SaaS** (Next.js 15 App Router · React 19 · TS · Tailwind v4 ·
Supabase). Each dealer is a **row in `public.tenants`** resolved at runtime from the request
host; tenant isolation is enforced by `tenant_id` + Postgres **RLS**. It is **lead-based**
(persist a lead, then optional WhatsApp) — no cart/checkout/payments.

Full detail lives in [docs/](docs/) — read it, don't duplicate it here.
[OVERVIEW](docs/OVERVIEW.md) · [ARCHITECTURE](docs/ARCHITECTURE.md) ·
[DEVELOPMENT](docs/DEVELOPMENT.md) · [ONBOARDING_A_TENANT](docs/ONBOARDING_A_TENANT.md) ·
[DEPLOYMENT](docs/DEPLOYMENT.md) · [ROADMAP](docs/ROADMAP.md).

## Hard rules

- **Do NOT reintroduce a static `data/cars.ts`.** It was removed; the storefront is fully
  Supabase-backed via `lib/supabase/queries.server.ts`. Read tenant/inventory data from
  Supabase + the `Tenant*Provider` hooks — never from `config/*` or `data/*` for
  tenant-varying values.
- **Public lead inserts are WRITE-ONLY. Never chain `.select()`/RETURNING on an anon `leads`
  insert** — anon has no SELECT policy, so RETURNING returns `42501` and rolls the row back
  (`lib/leads/submit.ts`). Resolve `tenant_id` from the `x-tenant-id` header server-side, never
  from the client.
- **Always use `safeRandomUUID()` (`lib/utils/uuid.ts`) — never `crypto.randomUUID()`.** The
  native call is `undefined` on plain-HTTP origins (`dealer2.lvh.me`) and crashes the page.
- **Never touch a tenant's RLS boundary casually.** UPDATE policies intentionally omit
  `WITH CHECK` (USING doubles as the new-row check). `.eq('tenant_id', …)` is a selector, not
  security. Keep `npx tsx scripts/test-rls.ts` green after any schema/policy/leads/tenant change.
- **Use the correct Supabase client:** `createPublicServerClient()` = anon storefront reads;
  `createSupabaseServerClient()` (`lib/supabase/server.ts`) = dashboard as the logged-in user;
  `createServerClient()` = service role (bypasses RLS) — scripts/trusted mutations only;
  `createBrowserClient()` = client-side auth.
- **Migrations are idempotent and applied by hand in the Supabase SQL editor** — no
  `supabase db push` / Docker. Use `IF [NOT] EXISTS` / drop-before-create / `DO`-block guards,
  document apply order in the header, and `NOTIFY pgrst, 'reload schema';` after schema changes.
  `ALTER TYPE … ADD VALUE` must not run in a txn that also uses the value (add-only migrations).
  SECURITY DEFINER functions must `set search_path = ''` + schema-qualify.
- **`price_monthly` = rental monthly; `installment_monthly` = financing instalment — never
  conflate them** (P7/P8). `down_payment` + `installment_monthly` are the financing pair; the
  baseline `monthly_installment` column is a legacy orphan (no writer, pending drop).
- **Fonts are self-hosted `@font-face` in `app/fonts.css`.** There is no `lib/fonts.ts` and no
  `next/font` — don't add them.
- **Regenerate `lib/supabase/database.types.ts` as UTF-8** on Windows
  (`... | Out-File -Encoding utf8 ...`) — a `>` redirect writes UTF-16 and breaks the build.
- This is a **documentation/logic-preserving** environment by default: don't change
  data/gating/business logic unless the task asks.

## Folder map (one line each)

```
app/(site)/[locale]/     storefront (ar/en, RTL) — tenant scoped by request HOST
app/(system)/dashboard/  dealer app — tenant scoped by logged-in USER (my_tenant_id)
app/(system)/auth/       Supabase auth
middleware.ts            host→tenant resolution + x-tenant-id header; auth session check
lib/tenant/              resolveTenant (edge), features, plans, sections, pages, content, branding
lib/supabase/            client(s), server, getTenant, queries.server, mappers, database.types
lib/leads/               submit (write-only), markWhatsapp, schema
lib/search/              Fuse.js index/search/normalize
config/                  global NON-tenant fallback defaults (site/seo/features)
data/                    static content only (booking, faq, services, cars-content types)
supabase/migrations/     version-controlled schema + RLS (apply via SQL editor, in order)
scripts/test-rls.ts      RLS isolation proof
```

## Verify before considering a change complete

```bash
npm run build                 # must be green
npm run lint                  # eslint clean
npx tsx scripts/test-rls.ts   # RLS proof — set TEST_TENANT_A_* for the full cross-tenant run
```

No `npm test` / `npm run test-rls` scripts exist — run the RLS proof with `npx tsx` directly.
If the schema changed: regenerate types (UTF-8) and re-apply/verify the migration in Supabase.
