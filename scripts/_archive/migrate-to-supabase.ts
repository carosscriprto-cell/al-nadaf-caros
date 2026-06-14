// ============================================================================
// CAROS — Phase 3 Seed Script (static cars.ts + cars-content → Supabase)
// ============================================================================
// One-time seed + repoint. Maps static `cars` + `carContent{En,Ar}` into the
// `cars` and `car_content` tables under the TARGET tenant, respecting the P2
// market-complete enums (validated against the generated Constants).
//
// MODES (default = dry-run, NO writes):
//   npx tsx scripts/migrate-to-supabase.ts            → dry-run: map + validate + log, no DB writes
//   npx tsx scripts/migrate-to-supabase.ts --write    → upsert seed (idempotent), no wipe
//   npx tsx scripts/migrate-to-supabase.ts --write --wipe
//                                                     → safety-export, delete tenant car rows, then seed
//
// Idempotent: cars upsert on (tenant_id, slug); car_content upsert on (car_id, locale).
//
// Env (.env.local):
//   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY     (service role — bypasses RLS for seed/wipe)
//   NEXT_PUBLIC_TENANT_ID         (TARGET tenant — rows are seeded/wiped under this id)
// ============================================================================

import { config } from 'dotenv';
config({ path: '.env.local' });

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import type { Database } from '../lib/supabase/database.types';
import { Constants } from '../lib/supabase/database.types';

import { cars } from '../data/cars';
import { carContentEn } from '../data/cars-content/en';
import { carContentAr } from '../data/cars-content/ar';

// ─── CLI flags ───────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const WIPE = argv.includes('--wipe');
const DRY = !WRITE;

// ─── Env ─────────────────────────────────────────────────────────────────────
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    console.error(`❌ Missing env: ${name} (set it in .env.local)`);
    process.exit(1);
  }
  return value;
}
const URL = requireEnv('SUPABASE_URL', process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);
const SERVICE = requireEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
const TENANT_ID = requireEnv('NEXT_PUBLIC_TENANT_ID', process.env.NEXT_PUBLIC_TENANT_ID);

const supabase = createClient<Database>(URL, SERVICE, {
  auth: { persistSession: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
});

const E = Constants.public.Enums;

// ─── Enum validation ─────────────────────────────────────────────────────────
// Fails loud BEFORE any write if static data carries a value outside the DB enum.
const validationErrors: string[] = [];
function assertEnum<T extends string>(value: T, allowed: readonly T[], field: string, slug: string) {
  if (!allowed.includes(value)) {
    validationErrors.push(`  ✗ ${slug}: ${field}="${value}" not in DB enum [${allowed.join(', ')}]`);
  }
}

// ─── Mappers (mirror lib/supabase/mappers.ts, reverse direction) ──────────────
type CarRow = Database['public']['Tables']['cars']['Insert'];
type ContentRow = Database['public']['Tables']['car_content']['Insert'];

function mapCarToRow(car: (typeof cars)[number]): CarRow {
  // Validate enums (collected, reported before write)
  assertEnum(car.listingType, E.listing_type, 'listing_type', car.slug);
  assertEnum(car.condition, E.car_condition, 'condition', car.slug);
  assertEnum(car.category, E.car_category, 'category', car.slug);
  assertEnum(car.class, E.car_class, 'class', car.slug);
  assertEnum(car.transmission, E.transmission, 'transmission', car.slug);
  assertEnum(car.fuelType, E.fuel_type, 'fuel_type', car.slug);
  if (car.drivetrain) assertEnum(car.drivetrain, E.drivetrain, 'drivetrain', car.slug);
  assertEnum(car.pricing.currency, E.currency, 'currency', car.slug);

  // Step 2 guard: the seed must never emit category='electric'. Static categories
  // are sedan/suv only, so this never trips — but assert it explicitly so a future
  // static edit can't silently reintroduce the flagged value.
  if (car.category === ('electric' as typeof car.category)) {
    validationErrors.push(`  ✗ ${car.slug}: category='electric' is forbidden by seed (use fuel_type='electric' + a real category)`);
  }

  return {
    tenant_id: TENANT_ID,
    slug: car.slug,
    brand: car.brand,
    model: car.model,
    trim: car.trim ?? null,
    year: car.year,
    is_hero: car.isHero ?? false,
    is_featured: car.isFeatured ?? false,
    is_popular: car.isPopular ?? false,
    is_new_arrival: car.isNewArrival ?? false,
    is_best_seller: car.isBestSeller ?? false,
    available: car.available ?? true,
    listing_type: car.listingType,
    condition: car.condition,
    // Pricing
    currency: car.pricing.currency,
    price_hourly: car.pricing.hourly ?? null,
    price_daily: car.pricing.daily ?? null,
    price_weekly: car.pricing.weekly ?? null,
    price_monthly: car.pricing.monthly ?? null,
    price_total: car.pricing.total ?? null,
    price_old: car.pricing.oldPrice ?? null,
    security_deposit: car.pricing.securityDeposit ?? null,
    min_rental_days: car.pricing.minimumRentalDays ?? null,
    negotiable: car.pricing.negotiable ?? false,
    financing_available: car.pricing.financingAvailable ?? false,
    monthly_installment: car.pricing.monthlyInstallment ?? null,
    // Specs
    category: car.category,
    class: car.class,
    transmission: car.transmission,
    fuel_type: car.fuelType,
    drivetrain: car.drivetrain ?? null,
    seats: car.seats,
    doors: car.doors,
    mileage: car.mileage,
    color: car.color ?? null,
    interior_color: car.interiorColor ?? null,
    engine: car.engine ?? null,
    cylinders: car.cylinders ?? null,
    horsepower: car.horsepower ?? null,
    torque: car.torque ?? null,
    top_speed: car.topSpeed ?? null,
    acceleration: car.acceleration ?? null,
    electric_range: car.electricRange ?? null,
    fuel_tank_capacity: car.fuelTankCapacity ?? null,
    // Fuel consumption
    fuel_city: car.fuelConsumption?.city ?? null,
    fuel_highway: car.fuelConsumption?.highway ?? null,
    fuel_combined: car.fuelConsumption?.combined ?? null,
    fuel_per_20km: car.fuelConsumption?.approxPer20Km ?? null,
    // Location
    city: car.city,
    country: car.country,
    address: car.address ?? null,
    delivery_available: car.deliveryAvailable ?? false,
    pickup_locations: car.pickupLocations ?? [],
    // Ownership
    owners_count: car.ownershipHistory?.owners ?? null,
    accident_free: car.ownershipHistory?.accidentFree ?? null,
    service_history: car.ownershipHistory?.serviceHistory ?? null,
    // Media
    thumbnail: car.thumbnail,
    images: car.images ?? [],
    // Ratings
    rating: car.rating ?? null,
    reviews_count: car.reviewsCount ?? 0,
  };
}

function mapContentToRow(carId: string, locale: 'en' | 'ar', content: { title: string; shortDescription?: string; description?: string; overview?: { idealFor?: string[]; pros?: string[]; cons?: string[] }; features?: string[]; comfortFeatures?: string[]; safetyFeatures?: string[]; entertainmentFeatures?: string[]; requirements?: string[]; includedServices?: string[]; warranty?: string }): ContentRow {
  return {
    car_id: carId,
    locale,
    title: content.title,
    short_description: content.shortDescription ?? null,
    description: content.description ?? null,
    ideal_for: content.overview?.idealFor ?? [],
    pros: content.overview?.pros ?? [],
    cons: content.overview?.cons ?? [],
    features: content.features ?? [],
    comfort_features: content.comfortFeatures ?? [],
    safety_features: content.safetyFeatures ?? [],
    entertainment_features: content.entertainmentFeatures ?? [],
    requirements: content.requirements ?? [],
    included_services: content.includedServices ?? [],
    warranty: content.warranty ?? null,
  };
}

// ─── Safety export (before wipe) ──────────────────────────────────────────────
async function safetyExport(): Promise<number> {
  const { data: liveCars, error } = await supabase
    .from('cars')
    .select('*, car_content(*)')
    .eq('tenant_id', TENANT_ID);
  if (error) throw error;

  const dir = join(process.cwd(), 'scripts', '_backups');
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = join(dir, `tenant-${TENANT_ID}-${stamp}.json`);
  writeFileSync(file, JSON.stringify({ tenantId: TENANT_ID, exportedAt: new Date().toISOString(), count: liveCars?.length ?? 0, cars: liveCars ?? [] }, null, 2), 'utf8');
  console.log(`  💾 Safety export: ${liveCars?.length ?? 0} cars → ${file}`);
  return liveCars?.length ?? 0;
}

// ─── Wipe ──────────────────────────────────────────────────────────────────────
async function wipeTenantCars() {
  const { data: ids, error: idErr } = await supabase.from('cars').select('id').eq('tenant_id', TENANT_ID);
  if (idErr) throw idErr;
  const carIds = (ids ?? []).map((r) => r.id);
  if (carIds.length === 0) {
    console.log('  (no existing rows to wipe)');
    return;
  }
  // Delete content first (explicit; does not rely on FK cascade), then cars.
  const { error: cErr } = await supabase.from('car_content').delete().in('car_id', carIds);
  if (cErr) throw cErr;
  const { error: carErr } = await supabase.from('cars').delete().eq('tenant_id', TENANT_ID);
  if (carErr) throw carErr;
  console.log(`  🗑️  Deleted ${carIds.length} cars + their content under tenant`);
}

// ─── Seed ──────────────────────────────────────────────────────────────────────
async function seed() {
  let ok = 0;
  let fail = 0;
  for (const car of cars) {
    const carRow = mapCarToRow(car);
    const { data: inserted, error: carErr } = await supabase
      .from('cars')
      .upsert(carRow, { onConflict: 'tenant_id,slug' })
      .select('id')
      .single();
    if (carErr || !inserted) {
      console.error(`  ✗ ${car.slug}: ${carErr?.message}`);
      fail++;
      continue;
    }
    const contentRows: ContentRow[] = [];
    if (carContentEn[car.slug]) contentRows.push(mapContentToRow(inserted.id, 'en', carContentEn[car.slug]));
    if (carContentAr[car.slug]) contentRows.push(mapContentToRow(inserted.id, 'ar', carContentAr[car.slug]));
    if (contentRows.length) {
      const { error: ctErr } = await supabase.from('car_content').upsert(contentRows, { onConflict: 'car_id,locale' });
      if (ctErr) console.warn(`  ⚠ ${car.slug} content: ${ctErr.message}`);
    }
    ok++;
  }
  console.log(`  📊 Seeded ${ok} cars (${fail} failed)`);
  return { ok, fail };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== Phase 3 Seed ===');
  console.log(`  mode    : ${DRY ? 'DRY-RUN (no writes)' : WIPE ? 'WRITE + WIPE' : 'WRITE (upsert, no wipe)'}`);
  console.log(`  tenant  : ${TENANT_ID}`);
  console.log(`  static  : ${cars.length} cars, content en=${Object.keys(carContentEn).length} ar=${Object.keys(carContentAr).length}\n`);

  // Map + validate everything up front (also populates validationErrors).
  const rows = cars.map(mapCarToRow);
  const missingContent = cars.filter((c) => !carContentEn[c.slug] || !carContentAr[c.slug]);

  if (validationErrors.length) {
    console.error('❌ Enum/value validation FAILED — aborting (no writes):');
    validationErrors.forEach((e) => console.error(e));
    process.exit(1);
  }
  console.log('  ✓ All enum values valid against P2 DB Constants');
  if (missingContent.length) {
    console.warn(`  ⚠ ${missingContent.length} cars missing en/ar content: ${missingContent.map((c) => c.slug).join(', ')}`);
  } else {
    console.log('  ✓ Every car has en + ar content');
  }

  if (DRY) {
    console.log('\n  --- DRY-RUN sample (first 3 mapped car rows) ---');
    rows.slice(0, 3).forEach((r) => console.log(`    ${r.slug}: ${r.brand} ${r.model} ${r.year} [${r.category}/${r.class}/${r.fuel_type}/${r.listing_type}]`));
    console.log(`\n  Would ${WIPE ? 'WIPE then ' : ''}upsert ${rows.length} cars + content under tenant.`);
    console.log('  No DB writes performed. Re-run with --write (and optionally --wipe) to apply.\n');
    return;
  }

  if (WIPE) {
    console.log('\n  --- WIPE ---');
    await safetyExport();
    await wipeTenantCars();
  }

  console.log('\n  --- SEED ---');
  const { fail } = await seed();

  // Verify counts
  const { count, error: cntErr } = await supabase
    .from('cars')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', TENANT_ID);
  if (cntErr) throw cntErr;
  console.log(`\n  --- VERIFY ---`);
  console.log(`  live cars under tenant now: ${count}`);
  console.log(`  expected (static)         : ${cars.length}`);
  console.log(count === cars.length ? '  ✅ counts match' : '  ⚠ counts differ — investigate');
  if (fail) process.exitCode = 1;
  console.log('\n=== Done ===\n');
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});
