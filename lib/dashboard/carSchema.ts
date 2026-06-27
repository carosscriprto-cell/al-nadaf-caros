// lib/dashboard/carSchema.ts — full create/edit schema (client + server).
// Covers every inventoried car field + bilingual car_content. Enums sourced
// from generated Constants (market-complete).

import { z } from 'zod';
import { Constants } from '@/lib/supabase/database.types';

const E = Constants.public.Enums;

export const CAR_STATUSES = ['available', 'sold', 'reserved'] as const;

const optStr = z.string().trim().optional().or(z.literal(''));
const optNum = z.coerce.number().nonnegative().optional();
const strArr = z.array(z.string().trim().min(1)).default([]);

// Per-locale content (car_content row). Per-locale everything is optional here;
// the PRIMARY locale (en) requires title + short_description via superRefine on
// carFormSchema — the secondary locale can be filled/translated later.
export const contentLocaleSchema = z.object({
  title: z.string().trim().default(''),
  short_description: z.string().trim().default(''),
  description: optStr,
  features: strArr,
  comfort_features: strArr,
  safety_features: strArr,
  entertainment_features: strArr,
  requirements: strArr,
  included_services: strArr,
  ideal_for: strArr,
  pros: strArr,
  cons: strArr,
  warranty: optStr,
});
export type ContentLocaleValues = z.output<typeof contentLocaleSchema>;

export const carFormSchema = z.object({
  // ── identity / classification ──
  // brand = display name (kept for the slug + legacy readability); brand_slug =
  // canonical car_brands reference (E1). Both are set by the brand picker.
  // brand_slug is OPTIONAL in the base schema so editing a legacy car (brand_slug
  // = null) is never blocked; it is REQUIRED only via carCreateSchema (new cars).
  brand: z.string().trim().min(1, 'Required'),
  brand_slug: z.string().trim().default(''),
  model: z.string().trim().min(1, 'Required'),
  year: z.coerce.number().int().min(1950).max(2100),
  trim: optStr,
  listing_type: z.enum(E.listing_type),
  condition: z.enum(E.car_condition),
  category: z.enum(E.car_category),
  class: z.enum(E.car_class),
  status: z.enum(CAR_STATUSES).default('available'),

  // ── media ──
  // id is supplied by the client on CREATE so storage uploads can use the final
  // car_id path ({tenant}/cars/{id}/) before the row exists. thumbnail = primary
  // image; images = ordered gallery (public Storage URLs).
  id: z.string().uuid().optional(),
  thumbnail: z.string().trim().default(''),
  images: z.array(z.string().trim()).default([]),

  // ── promotion / visibility ──
  available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_hero: z.boolean().default(false),
  is_popular: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),

  // ── pricing (shared) ──
  currency: z.enum(E.currency).default('USD'),
  // sale
  price_total: optNum,
  price_old: optNum,
  negotiable: z.boolean().default(false),
  financing_available: z.boolean().default(false),
  monthly_installment: optNum,
  // rental
  price_daily: optNum,
  price_weekly: optNum,
  price_monthly: optNum,
  price_hourly: optNum,
  security_deposit: optNum,
  min_rental_days: optNum,
  mileage_limit: optNum,
  insurance: optStr,

  // ── specs ──
  transmission: z.enum(E.transmission),
  fuel_type: z.enum(E.fuel_type),
  drivetrain: z.enum(E.drivetrain).optional(),
  seats: z.coerce.number().int().min(1).max(50),
  doors: z.coerce.number().int().min(1).max(10),
  mileage: z.coerce.number().int().nonnegative(),
  color: z.string().trim().min(1, 'Required'),
  interior_color: optStr,
  engine: optStr,
  cylinders: optNum,
  horsepower: optNum,
  torque: optNum,
  top_speed: optNum,
  acceleration: optStr,
  fuel_tank_capacity: optNum,
  electric_range: optNum,
  fuel_city: optNum,
  fuel_highway: optNum,
  fuel_combined: optNum,
  fuel_per_20km: optNum,

  // ── location / logistics ──
  city: z.string().trim().min(1, 'Required'),
  country: z.string().trim().min(1, 'Required'),
  address: optStr,
  delivery_available: z.boolean().default(false),
  pickup_locations: strArr,

  // ── ownership history (sale) ──
  owners_count: optNum,
  accident_free: z.boolean().default(false),
  service_history: z.boolean().default(false),

  // ── bilingual content ──
  content: z.object({ en: contentLocaleSchema, ar: contentLocaleSchema }),
}).superRefine((d, ctx) => {
  // The relevant price for the listing type is required.
  const isSale = d.listing_type === 'sale' || d.listing_type === 'both';
  const isRent = d.listing_type === 'rent' || d.listing_type === 'both';
  if (isSale && !d.price_total) ctx.addIssue({ code: 'custom', path: ['price_total'], message: 'Required' });
  if (isRent && !d.price_daily) ctx.addIssue({ code: 'custom', path: ['price_daily'], message: 'Required' });

  // PRIMARY locale (en, the app default) must have title + short description.
  // The secondary locale (ar) is optional — translate later.
  if (!d.content.en.title.trim()) ctx.addIssue({ code: 'custom', path: ['content', 'en', 'title'], message: 'Required' });
  if (!d.content.en.short_description.trim()) ctx.addIssue({ code: 'custom', path: ['content', 'en', 'short_description'], message: 'Required' });
});

export type CarFormValues = z.output<typeof carFormSchema>;

// Create-only schema: a brand pick is mandatory for NEW cars (kills free-text).
// Edits use carFormSchema, so a pre-existing row with brand_slug = null can still
// be saved without forcing a pick — the picker is offered, not blocking.
export const carCreateSchema = carFormSchema.superRefine((d, ctx) => {
  if (!d.brand_slug.trim()) ctx.addIssue({ code: 'custom', path: ['brand_slug'], message: 'Required' });
});

export function slugify(brand: string, model: string, year: number) {
  return `${brand}-${model}-${year}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
