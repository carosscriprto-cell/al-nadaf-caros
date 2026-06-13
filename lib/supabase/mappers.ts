// lib/supabase/mappers.ts
// ─────────────────────────────────────────────────────────────
// يحول rows من Supabase إلى الـ types المستخدمة في المشروع
// هذا الملف هو الجسر بين database.types.ts و types/vehicles.ts
// ─────────────────────────────────────────────────────────────

import type { Tables } from './database.types';
import type { Car, CarContentEntry, CarContentMap } from '@/types/vehicles';

type DbCar = Tables<'cars'>;
type DbContent = Tables<'car_content'>;

// ─── Car mapper ───────────────────────────────────────────────

export function mapDbCarToCar(row: DbCar): Car {
  return {
    id:            row.id,
    slug:          row.slug,
    brand:         row.brand,
    model:         row.model,
    trim:          row.trim ?? undefined,
    year:          row.year,
    isHero:        row.is_hero ?? false,
    listingType:   row.listing_type,
    condition:     row.condition,
    category:      row.category,
    class:         row.class,
    available:     row.available,
    isFeatured:    row.is_featured ?? false,
    isPopular:     row.is_popular ?? false,
    isNewArrival:  row.is_new_arrival ?? false,
    isBestSeller:  row.is_best_seller ?? false,
    transmission:  row.transmission,
    fuelType:      row.fuel_type,
    drivetrain:    row.drivetrain ?? undefined,
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
      currency:            row.currency,
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