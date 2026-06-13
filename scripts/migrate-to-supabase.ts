// ============================================================
// CAROS — Migration Script
// يحول بيانات cars.ts + cars-content إلى Supabase
// 
// الاستخدام:
//   npx tsx scripts/migrate-to-supabase.ts
//
// المتطلبات:
//   npm install @supabase/supabase-js tsx dotenv
// ============================================================
import 'dotenv/config';
import WebSocket from 'ws';
import { createClient } from '@supabase/supabase-js';

// ─── استورد البيانات الثابتة ─────────────────────────────────
// عدّل المسارات حسب مشروعك
import { cars } from '../data/cars';
import { carContentEn } from '../data/cars-content/en';
import { carContentAr } from '../data/cars-content/ar';

// ─── Config ──────────────────────────────────────────────────
const SUPABASE_URL     = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!; // service role لتجاوز RLS

// بيانات الـ tenant الأول (عدّلها)
const FIRST_TENANT = {
  slug:           'caros-demo',
  name:           'Caros Demo',
  name_ar:        'كاروس',
  subdomain:      'demo',
  plan:           'pro',
  color_primary:  '#000000',
  color_secondary:'#ffffff',
  color_accent:   '#3b82f6',
  whatsapp:       '+15551234567',
  email:          'info@caros.com',
};

// ─── Main ─────────────────────────────────────────────────────
async function migrate() {
  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE,
    {
        realtime: {
        transport: WebSocket as any,
        },
    }
    );

  console.log('🚀 Starting migration...\n');

  // 1. إنشاء الـ tenant
  console.log('📋 Creating tenant...');
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert(FIRST_TENANT)
    .select()
    .single();

  if (tenantError) {
    // لو موجود مسبقاً، اجلبه
    const { data: existing } = await supabase
      .from('tenants')
      .select()
      .eq('slug', FIRST_TENANT.slug)
      .single();

    if (!existing) throw tenantError;
    console.log(`  ✓ Tenant exists: ${existing.id}`);
    await migrateCars(supabase, existing.id);
  } else {
    console.log(`  ✓ Tenant created: ${tenant.id}`);
    await migrateCars(supabase, tenant.id);
  }

  console.log('\n✅ Migration complete!');
}

// ─── Migrate Cars ─────────────────────────────────────────────
async function migrateCars(supabase: any, tenantId: string) {
  console.log(`\n🚗 Migrating ${cars.length} cars...`);

  let success = 0;
  let failed  = 0;

  for (const car of cars) {
    try {
      // 1. Insert car
      const carRow = mapCarToRow(car, tenantId);

      const { data: insertedCar, error: carError } = await supabase
        .from('cars')
        .upsert(carRow, { onConflict: 'tenant_id,slug' })
        .select()
        .single();

      if (carError) throw carError;

      // 2. Insert content EN
      const contentEn = carContentEn[car.slug];
      if (contentEn) {
        const { error: enError } = await supabase
          .from('car_content')
          .upsert(
            mapContentToRow(insertedCar.id, 'en', contentEn),
            { onConflict: 'car_id,locale' }
          );
        if (enError) console.warn(`  ⚠ EN content error for ${car.slug}:`, enError.message);
      }

      // 3. Insert content AR
      const contentAr = carContentAr[car.slug];
      if (contentAr) {
        const { error: arError } = await supabase
          .from('car_content')
          .upsert(
            mapContentToRow(insertedCar.id, 'ar', contentAr),
            { onConflict: 'car_id,locale' }
          );
        if (arError) console.warn(`  ⚠ AR content error for ${car.slug}:`, arError.message);
      }

      console.log(`  ✓ ${car.brand} ${car.model} ${car.year}`);
      success++;

    } catch (err: any) {
      console.error(`  ✗ Failed: ${car.slug} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  📊 Results: ${success} success, ${failed} failed`);
}

// ─── Mappers ──────────────────────────────────────────────────

function mapCarToRow(car: any, tenantId: string) {
  return {
    tenant_id:          tenantId,
    slug:               car.slug,
    brand:              car.brand,
    model:              car.model,
    trim:               car.trim ?? null,
    year:               car.year,
    is_hero:            car.isHero ?? false,
    is_featured:        car.isFeatured ?? false,
    is_popular:         car.isPopular ?? false,
    is_new_arrival:     car.isNewArrival ?? false,
    is_best_seller:     car.isBestSeller ?? false,
    available:          car.available ?? true,
    listing_type:       car.listingType,
    condition:          car.condition,

    // Pricing
    currency:           car.pricing.currency,
    price_hourly:       car.pricing.hourly ?? null,
    price_daily:        car.pricing.daily ?? null,
    price_weekly:       car.pricing.weekly ?? null,
    price_monthly:      car.pricing.monthly ?? null,
    price_total:        car.pricing.total ?? null,
    price_old:          car.pricing.oldPrice ?? null,
    security_deposit:   car.pricing.securityDeposit ?? null,
    min_rental_days:    car.pricing.minimumRentalDays ?? null,
    negotiable:         car.pricing.negotiable ?? false,
    financing_available:car.pricing.financingAvailable ?? false,
    monthly_installment:car.pricing.monthlyInstallment ?? null,

    // Specs
    category:           car.category,
    class:              car.class,
    transmission:       car.transmission,
    fuel_type:          car.fuelType,
    drivetrain:         car.drivetrain ?? null,
    seats:              car.seats,
    doors:              car.doors,
    mileage:            car.mileage,
    color:              car.color ?? null,
    interior_color:     car.interiorColor ?? null,
    engine:             car.engine ?? null,
    cylinders:          car.cylinders ?? null,
    horsepower:         car.horsepower ?? null,
    torque:             car.torque ?? null,
    top_speed:          car.topSpeed ?? null,
    acceleration:       car.acceleration ?? null,
    electric_range:     car.electricRange ?? null,
    fuel_tank_capacity: car.fuelTankCapacity ?? null,

    // Fuel consumption
    fuel_city:          car.fuelConsumption?.city ?? null,
    fuel_highway:       car.fuelConsumption?.highway ?? null,
    fuel_combined:      car.fuelConsumption?.combined ?? null,
    fuel_per_20km:      car.fuelConsumption?.approxPer20Km ?? null,

    // Location
    city:               car.city,
    country:            car.country,
    address:            car.address ?? null,
    delivery_available: car.deliveryAvailable ?? false,
    pickup_locations:   car.pickupLocations ?? [],

    // Ownership
    owners_count:       car.ownershipHistory?.owners ?? null,
    accident_free:      car.ownershipHistory?.accidentFree ?? null,
    service_history:    car.ownershipHistory?.serviceHistory ?? null,

    // Media
    thumbnail:          car.thumbnail,
    images:             car.images ?? [],

    // Ratings
    rating:             car.rating ?? null,
    reviews_count:      car.reviewsCount ?? 0,
  };
}

function mapContentToRow(carId: string, locale: string, content: any) {
  return {
    car_id:                 carId,
    locale,
    title:                  content.title,
    short_description:      content.shortDescription ?? null,
    description:            content.description ?? null,
    ideal_for:              content.overview?.idealFor ?? [],
    pros:                   content.overview?.pros ?? [],
    cons:                   content.overview?.cons ?? [],
    features:               content.features ?? [],
    comfort_features:       content.comfortFeatures ?? [],
    safety_features:        content.safetyFeatures ?? [],
    entertainment_features: content.entertainmentFeatures ?? [],
    requirements:           content.requirements ?? [],
    included_services:      content.includedServices ?? [],
    warranty:               content.warranty ?? null,
  };
}

// ─── Run ──────────────────────────────────────────────────────
migrate().catch((err) => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});