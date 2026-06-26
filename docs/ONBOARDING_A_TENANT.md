# Onboarding a New Tenant (Dealer)

The operational runbook for adding a dealer. **Onboarding is currently manual** (DB inserts by an operator) until V3 self-signup. After the inserts, the dealer does the rest from the dashboard.

Prereqs: access to the Supabase project (Dashboard + SQL editor), and the values for the new dealer (name, slug, plan, brand colors, contact).

---

## Step 1 — Create the Auth user

Supabase Dashboard → **Authentication → Users → Add user**. Use the dealer owner's email + a password (or invite). Copy the new user's **UUID** — you need it in Step 3.

> The user must exist in `auth.users` before linking; `tenant_users.user_id` has an FK to it.

## Step 2 — INSERT the `tenants` row

Run in **SQL editor**. Only `name` and `slug` are strictly required (everything else has a default or is nullable), but set `plan`, colors, contact, and `subdomain` for a real launch. Apply the plan's **features preset** (see the table below) to `features`.

```sql
insert into public.tenants (
  name, name_ar, slug, subdomain,           -- identity + how the host resolves
  plan, active,
  color_primary, color_secondary, color_accent,
  email, phone, whatsapp,
  address_en, address_ar,
  seo_title_en, seo_desc_en,
  features
) values (
  'Premier Motors', 'بريمير موتورز', 'premier', 'premier',  -- premier.<base-domain> resolves here
  'pro', true,
  '#0A0A0A', '#FFFFFF', '#75ACE8',                          -- brand colors (injected as CSS vars)
  'sales@premier.example', '+10000000000', '+10000000000',  -- whatsapp = the lead channel
  '12 Showroom Rd, City', 'العنوان',
  'Premier Motors — Cars for sale & rent', 'Browse our certified inventory.',
  -- features preset for the chosen plan (see table); JSON must match TenantFeatures:
  '{
     "maxCars": 75, "maxImagesPerCar": 8,
     "enableSellCar": true, "enableRental": true, "enableFinancing": true,
     "enableWhatsApp": true, "enableVipDelivery": false,
     "enableEmailContact": true, "enablePhoneContact": true
   }'::jsonb
)
returning id;   -- copy this tenant id for Step 3
```

**Required vs optional columns:**

| Required (no usable default) | Has a default | Nullable / optional |
|---|---|---|
| `name`, `slug` | `plan`='starter', `active`=true, `color_primary`='#000000', `color_secondary`='#ffffff', `color_accent`='#3b82f6', `features`='{}' | `name_ar`, `subdomain`, `domain`, contact, address, SEO, `logo_url`, `favicon_url`, `og_image_url`, jsonb (`sections`/`pages`/`content`/`business_hours`/`social`/`map_center`) |

- `slug` and `subdomain` (and `domain`, if custom) are **unique**. The host resolver matches subdomain → slug first, then `domain`/`subdomain` on the full host.
- Leave `sections`/`pages`/`content` **NULL** — the app applies safe defaults (all sections on, all pages on, static copy). The dealer can customize them later in the Site tab.

### Features preset per plan

Mirror `lib/tenant/plans.ts` (`getPlanFeatures(plan)`). Features may exceed the plan if you're upselling — `tenants.features` is the runtime authority.

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

`owner` can edit tenant settings and manage other users; `admin` can delete cars/pages; `editor` can create/update cars. (See the RLS role checks in `supabase/migrations/20260614091000_rls_policies.sql`.)

## Step 4 — Dealer self-serves the rest

The dealer logs in at `/auth/login` → `/dashboard` and completes setup themselves:
- **Settings** (`/dashboard/settings`): logo, favicon, OG image, colors, contact, business hours, map center, SEO.
- **Site** (`/dashboard/site`): toggle/reorder home **sections**, toggle optional **pages** & lead buttons, edit **content** (bilingual whyChooseUs / howItWorks / about).
- **Inventory** (`/dashboard/cars`): add vehicles + per-locale content; images upload to Supabase Storage.
- **Leads** (`/dashboard/leads`): the inbox for incoming leads.

Verify the storefront resolves: visit `https://<subdomain>.<base-domain>` (or `http://<slug>.lvh.me:3000` locally).

---

## Setting tenant type (sale-only / rental-only / hybrid)

Type is **purely the two feature flags** — there is no separate column. Set them in `features`:

| Type | `enableSellCar` | `enableRental` | Effect |
|---|---|---|---|
| **Sale-only** | `true` | `false` | No rental/booking; hero 4th filter = **Condition**; price filter shown |
| **Rental-only** | `false` | `true` | Booking entry shown; hero 4th filter = **Body type**; no sale price filter |
| **Hybrid** | `true` | `true` | Both; hero 4th filter = **listing type (sale/rent)** (`isHybridTenant`) |

```sql
-- Flip an existing tenant to rental-only:
update public.tenants
set features = features || '{"enableSellCar": false, "enableRental": true}'::jsonb
where slug = 'premier';
```

`isHybridTenant(features)` = `enableSellCar && enableRental` drives hybrid-only UI. Hybrid is *plan-gated* (`planAllowsHybrid`) for onboarding decisions, but not hard-enforced at runtime yet.

## Local testing — the 3-tenant pattern

For full coverage, keep three local tenants and exercise each:

| Slug | Plan | Features | Exercises |
|---|---|---|---|
| `dealer1` (hybrid+all) | enterprise | sale + rental + financing + VIP | hybrid hero filter, all sections, financing |
| `dealer2` (rental-only) | pro | `enableSellCar:false, enableRental:true` | booking entry, body-type filter, no price |
| `dealer3` (sale-only) | starter | `enableSellCar:true, enableRental:false` | condition filter, price filter, no booking |

Create them with Steps 1–3, then access via `lvh.me`:
- `http://dealer1.lvh.me:3000`, `http://dealer2.lvh.me:3000`, `http://dealer3.lvh.me:3000`
- or set `DEFAULT_TENANT_SLUG=dealer1` to render one on plain `http://localhost:3000`.

Use a tenant-A login in `.env.local` (`TEST_TENANT_A_EMAIL/PASSWORD`) so `npx tsx scripts/test-rls.ts` runs the full cross-tenant proof.
