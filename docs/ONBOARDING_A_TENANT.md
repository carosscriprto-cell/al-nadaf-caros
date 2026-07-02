# Onboarding a New Tenant (Dealer)

The operational runbook for adding a dealer. **Onboarding is currently manual** — DB inserts by
an operator (until a future self-signup). After the inserts, the dealer does the rest from the
dashboard. For the production hosting layer (domains / DNS / Vercel), see
[DEPLOYMENT.md](./DEPLOYMENT.md).

Prereqs: access to the Supabase project (Dashboard + SQL editor) and the new dealer's details
(name, slug, plan, brand colors, contact).

---

## Step 1 — Create the Auth user

Supabase Dashboard → **Authentication → Users → Add user**. Use the dealer owner's email + a
password (or invite). Copy the new user's **UUID** — needed in Step 3.

> The user must exist in `auth.users` before linking; `tenant_users.user_id` has an FK to it.

## Step 2 — INSERT the `tenants` row

Run in the **SQL editor**. Only `name` and `slug` are strictly required (everything else has a
default or is nullable), but set `plan`, colors, contact, and `subdomain` for a real launch.
Apply the plan's **features preset** (table below) to the `features` jsonb.

```sql
insert into public.tenants (
  name, name_ar, slug, subdomain,            -- identity + how the host resolves
  plan, active,
  color_primary, color_secondary, color_accent,
  email, phone, whatsapp,                     -- whatsapp = the lead channel
  address_en, address_ar,
  seo_title_en, seo_desc_en,
  features
) values (
  'Premier Motors', 'بريمير موتورز', 'premier', 'premier',  -- premier.<root-domain> resolves here
  'pro', true,
  '#0A0A0A', '#FFFFFF', '#75ACE8',                          -- injected as --color-* CSS vars
  'sales@premier.example', '+9710000000', '+9710000000',
  '12 Showroom Rd, City', 'العنوان',
  'Premier Motors — Cars for sale & rent', 'Browse our certified inventory.',
  -- features preset for the chosen plan (must match TenantFeatures — see table):
  '{
     "maxCars": 75, "maxImagesPerCar": 8,
     "enableSellCar": true, "enableRental": true, "enableFinancing": true,
     "enableWhatsApp": true, "enableVipDelivery": false,
     "enableEmailContact": true, "enablePhoneContact": true
   }'::jsonb
)
returning id;   -- copy this tenant id for Step 3
```

### Required vs optional columns (from `baseline_schema.sql`)

| Required (no usable default) | Has a DB default | Nullable / optional |
|---|---|---|
| `name`, `slug` | `plan`='starter', `active`=true, `color_primary`='#000000', `color_secondary`='#ffffff', `color_accent`='#3b82f6', `features`='{}' | `name_ar`, `subdomain`, `domain`, `email`, `phone`, `whatsapp`, `address_en/ar`, all SEO, `logo_url`, `favicon_url`, `og_image_url`, and the jsonb config (`sections`, `pages`, `content`, `business_hours`, `social`, `map_center`) |

- `slug`, `subdomain`, and `domain` are each **unique**. Resolution matches subdomain → `slug`
  first, then `domain`/`subdomain` on the full host (see [ARCHITECTURE.md](./ARCHITECTURE.md) §1).
- Leave `sections` / `pages` / `content` **NULL** — the app applies safe defaults (all sections
  on, all pages on, static copy). The dealer customizes them later in the **Site** tab.

### Features preset per plan

Mirror `lib/tenant/plans.ts` (`getPlanFeatures(plan)`). Features may exceed the plan if you're
upselling — `tenants.features` is the runtime authority, presets are onboarding defaults only.

| key | starter | pro | enterprise |
|---|---|---|---|
| `maxCars` | 25 | 75 | 200 |
| `maxImagesPerCar` | 5 | 8 | 12 |
| `enableSellCar` | true | true | true |
| `enableRental` | **false** | true | true |
| `enableFinancing` | false | true | true |
| `enableVipDelivery` | false | false | true |
| `enableWhatsApp` | true | true | true |
| `enableEmailContact` | true | true | true |
| `enablePhoneContact` | true | true | true |

## Step 3 — Link the user to the tenant

```sql
insert into public.tenant_users (tenant_id, user_id, role)
values (
  '<tenant-id-from-step-2>',
  '<auth-user-uuid-from-step-1>',
  'owner'            -- owner | admin | editor; the first user should be owner
);
```

Role → capability (from the RLS role checks in `20260614091000_rls_policies.sql`):
- `owner` — can edit tenant settings (`tenants` update is owner-only) and manage users.
- `admin` — can delete cars/pages (delete requires `admin|owner`).
- `editor` — can create/update cars.

## Step 4 — Dealer self-serves the rest

The dealer logs in at `/auth/login` → `/dashboard` and finishes setup themselves:
- **Settings** (`/dashboard/settings`): logo, favicon, OG image, colors, contact, business
  hours, map center, SEO.
- **Site** (`/dashboard/site`): toggle/reorder home **sections**, toggle optional **pages** &
  lead-capture buttons, edit **content** (bilingual hero / whyChooseUs / howItWorks / about /
  financing / finalCta / faq) — each field falls back to the static i18n copy when left blank.
  (The financing section is locked when `enableFinancing` is off.)
- **Inventory** (`/dashboard/cars`): add vehicles + per-locale content; images compress in the
  browser and upload to Supabase Storage.
- **Leads** (`/dashboard/leads`): the inbox for incoming leads (with a detail modal +
  WhatsApp/call/email quick actions).

Verify the storefront resolves: `https://<subdomain>.<root-domain>` in prod, or
`http://<slug>.lvh.me:3000` locally.

---

## Setting tenant type (sale-only / rental-only / hybrid)

Type is **purely the two feature flags** — there is no separate column
(`isHybridTenant(f) = enableSellCar && enableRental`, `lib/tenant/features.ts`).

| Type | `enableSellCar` | `enableRental` | Storefront effect |
|---|---|---|---|
| **Sale-only** | `true` | `false` | No rental/booking; hero 4th filter = **Condition** |
| **Rental-only** | `false` | `true` | Booking entry shown; hero 4th filter = **Body type** |
| **Hybrid** | `true` | `true` | Both; hero 4th filter = **listing type (sale/rent)** |

`storefrontListingTypes(features)` restricts which `listing_type` rows a single-type tenant
surfaces (rental-only → `['rent','both']`, sale-only → `['sale','both']`).

```sql
-- Flip an existing tenant to rental-only:
update public.tenants
set features = features || '{"enableSellCar": false, "enableRental": true}'::jsonb
where slug = 'premier';
```

Hybrid is *plan-gated* for onboarding decisions (`planAllowsHybrid`) but not hard-enforced at
runtime yet.

## Local testing — the 3-tenant pattern

Keep three local tenants to exercise each type:

| Slug | Plan | Features | Exercises |
|---|---|---|---|
| `dealer1` | enterprise | sale + rental + financing + VIP | hybrid hero filter, all sections, financing |
| `dealer2` | pro | `enableSellCar:false, enableRental:true` | booking entry, body-type filter |
| `dealer3` | starter | `enableSellCar:true, enableRental:false` | condition filter, no booking |

Create them with Steps 1–3, then access via `lvh.me`
(`http://dealer1.lvh.me:3000`, …), or set `DEFAULT_TENANT_SLUG=dealer1` to render one on plain
`http://localhost:3000`. Put a tenant-A login in `.env.local` (`TEST_TENANT_A_EMAIL/PASSWORD`)
so `npx tsx scripts/test-rls.ts` runs the full cross-tenant proof.
