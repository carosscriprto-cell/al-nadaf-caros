// lib/supabase/mappers.ts
// ─────────────────────────────────────────────────────────────
// يحول rows من Supabase إلى الـ types المستخدمة في المشروع
// هذا الملف هو الجسر بين database.types.ts و types/vehicles.ts
// ─────────────────────────────────────────────────────────────

import { Constants } from './database.types';
import type { Tables, Enums } from './database.types';
import type { Car, CarCategory, CarContentEntry, CarContentMap } from '@/types/vehicles';

type DbCar = Tables<'cars'>;
type DbContent = Tables<'car_content'>;

// ─── Enum guards ──────────────────────────────────────────────
// Validate DB enum values against the generated Constants (single source of
// truth). Never throws — logs unexpected values so data drift stays visible,
// and always returns a value that is within the DB enum.

function guardEnum<T extends string>(
  value: T,
  allowed: readonly T[],
  field: string,
  carId: string,
): T {
  if (!allowed.includes(value)) {
    console.warn(
      `[mapDbCarToCar] car ${carId}: unexpected ${field} "${value}" (not in DB enum). Returning as-is.`,
    );
  }
  return value;
}

// car_category needs its own guard: 'electric' is a valid DB value but is
// excluded from the domain CarCategory concept (P3 remap pending), so we log it
// and pass the real value through with an intentional, documented cast.
function guardCategory(value: Enums<'car_category'>, carId: string): CarCategory {
  if (!Constants.public.Enums.car_category.includes(value)) {
    console.warn(
      `[mapDbCarToCar] car ${carId}: unknown category "${value}" (not in DB enum).`,
    );
  } else if (value === 'electric') {
    console.warn(
      `[mapDbCarToCar] car ${carId}: category 'electric' is flagged for P3 remap (use fuel_type instead).`,
    );
  }
  return value as CarCategory;
}

// ─── Car mapper ───────────────────────────────────────────────

export function mapDbCarToCar(row: DbCar): Car {
  return {
    id:            row.id,
    slug:          row.slug,
    brand:         row.brand,
    brandSlug:     row.brand_slug ?? undefined,
    model:         row.model,
    trim:          row.trim ?? undefined,
    year:          row.year,
    isHero:        row.is_hero ?? false,
    listingType:   guardEnum(row.listing_type, Constants.public.Enums.listing_type, 'listing_type', row.id),
    condition:     guardEnum(row.condition, Constants.public.Enums.car_condition, 'condition', row.id),
    status:        (row.status === 'sold' || row.status === 'reserved') ? row.status : 'available',
    category:      guardCategory(row.category, row.id),
    class:         guardEnum(row.class, Constants.public.Enums.car_class, 'class', row.id),
    available:     row.available,
    isFeatured:    row.is_featured ?? false,
    isPopular:     row.is_popular ?? false,
    isNewArrival:  row.is_new_arrival ?? false,
    isBestSeller:  row.is_best_seller ?? false,
    transmission:  guardEnum(row.transmission, Constants.public.Enums.transmission, 'transmission', row.id),
    fuelType:      guardEnum(row.fuel_type, Constants.public.Enums.fuel_type, 'fuel_type', row.id),
    drivetrain:    row.drivetrain
                     ? guardEnum(row.drivetrain, Constants.public.Enums.drivetrain, 'drivetrain', row.id)
                     : undefined,
    seats:         row.seats,
    doors:         row.doors,
    mileage:       row.mileage,
    color:         row.color ?? undefined,
    interiorColor: row.interior_color ?? undefined,
    engine:        row.engine ?? undefined,
    cylinders:     row.cylinders ?? undefined,
    horsepower:    row.horsepower ?? undefined,
    torque:        row.torque ?? undefined,
    topSpeed:      row.top_speed ?? undefined,
    acceleration:  row.acceleration ?? undefined,
    electricRange: row.electric_range ?? undefined,
    fuelTankCapacity: row.fuel_tank_capacity ?? undefined,

    // Fuel consumption
    fuelConsumption: (row.fuel_city || row.fuel_highway || row.fuel_combined)
      ? {
          city:         row.fuel_city ?? undefined,
          highway:      row.fuel_highway ?? undefined,
          combined:     row.fuel_combined ?? undefined,
          approxPer20Km: row.fuel_per_20km ?? undefined,
        }
      : undefined,

    // Pricing — يجمع كل حقول التسعير في object واحد
    pricing: {
      currency:            guardEnum(row.currency, Constants.public.Enums.currency, 'currency', row.id),
      hourly:              row.price_hourly ?? undefined,
      daily:               row.price_daily ?? undefined,
      weekly:              row.price_weekly ?? undefined,
      monthly:             row.price_monthly ?? undefined,
      securityDeposit:     row.security_deposit ?? undefined,
      minimumRentalDays:   row.min_rental_days ?? undefined,
      total:               row.price_total ?? undefined,
      oldPrice:            row.price_old ?? undefined,
      negotiable:          row.negotiable ?? undefined,
      financingAvailable:  row.financing_available ?? undefined,
      monthlyInstallment:  row.monthly_installment ?? undefined,
    },

    // Location
    city:               row.city,
    country:            row.country,
    address:            row.address ?? undefined,
    deliveryAvailable:  row.delivery_available ?? false,
    pickupLocations:    row.pickup_locations ?? [],

    // Ownership (used cars)
    ownershipHistory: (row.owners_count !== null || row.accident_free !== null)
      ? {
          owners:         row.owners_count ?? undefined,
          accidentFree:   row.accident_free ?? undefined,
          serviceHistory: row.service_history ?? undefined,
        }
      : undefined,

    // Media
    thumbnail: row.thumbnail ?? '/Fleet/default/default-1.webp',
    images:    row.images ?? [],

    // Ratings
    rating:       row.rating ?? undefined,
    reviewsCount: row.reviews_count ?? 0,
  };
}

// ─── Content mapper ───────────────────────────────────────────

export function mapDbContentToEntry(row: DbContent): CarContentEntry {
  return {
    title:            row.title,
    shortDescription: row.short_description ?? undefined,
    description:      row.description ?? undefined,

    overview: (row.ideal_for?.length || row.pros?.length || row.cons?.length)
      ? {
          idealFor: row.ideal_for ?? [],
          pros:     row.pros ?? [],
          cons:     row.cons ?? [],
        }
      : undefined,

    features:               row.features ?? [],
    comfortFeatures:        row.comfort_features ?? [],
    safetyFeatures:         row.safety_features ?? [],
    entertainmentFeatures:  row.entertainment_features ?? [],
    requirements:           row.requirements ?? [],
    includedServices:       row.included_services ?? [],
    warranty:               row.warranty ?? undefined,
  };
}

// ─── Content map builder ──────────────────────────────────────
// يبني CarContentMap من array of content rows
// { 'bmw-5-series-2023': { en: {...}, ar: {...} } }

export function buildContentMap(
  cars: DbCar[],
  contentRows: DbContent[],
  locale: 'en' | 'ar'
): CarContentMap {
  const map: CarContentMap = {};

  for (const row of contentRows) {
    if (row.locale !== locale) continue;

    const car = cars.find(c => c.id === row.car_id);
    if (!car) continue;

    map[car.slug] = mapDbContentToEntry(row);
  }

  return map;
}