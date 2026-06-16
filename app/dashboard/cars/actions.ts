'use server';

// app/dashboard/cars/actions.ts — inventory mutations.
// All run via the AUTHENTICATED server client, so RLS (my_tenant_id + role)
// enforces tenant isolation and permissions server-side — the real guard, not
// just the UI. zod validates every input.

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { carFormSchema, slugify, CAR_STATUSES, type CarFormValues } from '@/lib/dashboard/carSchema';
import type { CarStatus } from '@/types/vehicles';
import type { ActionResult } from './types';

// Resolve the logged-in user's tenant + features (RLS-scoped read).
async function getMyTenant(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('tenant_users')
    .select('tenant_id, tenant:tenants(features)')
    .eq('user_id', user.id)
    .single();
  if (!data) return null;
  const features = (data.tenant?.features ?? {}) as Record<string, unknown>;
  return { tenantId: data.tenant_id, features };
}

function num(features: Record<string, unknown>, key: string, fallback: number) {
  const v = features[key];
  return typeof v === 'number' ? v : fallback;
}

function mapFormToRow(d: CarFormValues) {
  return {
    brand: d.brand, model: d.model, year: d.year, trim: d.trim || null,
    listing_type: d.listing_type, condition: d.condition, category: d.category, class: d.class,
    status: d.status,
    // available is an INDEPENDENT switch: a sold/reserved car can still be shown.
    available: d.available,
    is_featured: d.is_featured, is_hero: d.is_hero, is_popular: d.is_popular,
    is_new_arrival: d.is_new_arrival, is_best_seller: d.is_best_seller,
    currency: d.currency,
    // sale pricing
    price_total: d.price_total ?? null, price_old: d.price_old ?? null,
    negotiable: d.negotiable, financing_available: d.financing_available,
    monthly_installment: d.monthly_installment ?? null,
    // rental pricing + terms
    price_daily: d.price_daily ?? null, price_weekly: d.price_weekly ?? null,
    price_monthly: d.price_monthly ?? null, price_hourly: d.price_hourly ?? null,
    security_deposit: d.security_deposit ?? null, min_rental_days: d.min_rental_days ?? null,
    mileage_limit: d.mileage_limit ?? null, insurance: d.insurance || null,
    // specs
    transmission: d.transmission, fuel_type: d.fuel_type, drivetrain: d.drivetrain ?? null,
    seats: d.seats, doors: d.doors, mileage: d.mileage,
    color: d.color || null, interior_color: d.interior_color || null,
    engine: d.engine || null, cylinders: d.cylinders ?? null, horsepower: d.horsepower ?? null,
    torque: d.torque ?? null, top_speed: d.top_speed ?? null, acceleration: d.acceleration || null,
    fuel_tank_capacity: d.fuel_tank_capacity ?? null, electric_range: d.electric_range ?? null,
    fuel_city: d.fuel_city ?? null, fuel_highway: d.fuel_highway ?? null,
    fuel_combined: d.fuel_combined ?? null, fuel_per_20km: d.fuel_per_20km ?? null,
    // location / logistics
    city: d.city, country: d.country, address: d.address || null,
    delivery_available: d.delivery_available, pickup_locations: d.pickup_locations,
    // ownership (sale)
    owners_count: d.owners_count ?? null, accident_free: d.accident_free, service_history: d.service_history,
    // media — thumbnail falls back to the first gallery image, else null (the
    // mapper substitutes a placeholder for null).
    thumbnail: d.thumbnail || d.images[0] || null,
    images: d.images,
  };
}

function mapContentRow(carId: string, locale: 'en' | 'ar', c: CarFormValues['content']['en']) {
  return {
    car_id: carId, locale,
    title: c.title,
    short_description: c.short_description || null,
    description: c.description || null,
    features: c.features, comfort_features: c.comfort_features, safety_features: c.safety_features,
    entertainment_features: c.entertainment_features, requirements: c.requirements,
    included_services: c.included_services, ideal_for: c.ideal_for, pros: c.pros, cons: c.cons,
    warranty: c.warranty || null,
  };
}

async function upsertContent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  carId: string,
  d: CarFormValues,
) {
  await supabase.from('car_content').upsert(
    [mapContentRow(carId, 'en', d.content.en), mapContentRow(carId, 'ar', d.content.ar)],
    { onConflict: 'car_id,locale' },
  );
}

// ─── Create car (enforces features.maxCars — Layer 2 server guard) ───────────
export async function createCar(values: CarFormValues): Promise<ActionResult & { id?: string }> {
  const parsed = carFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  const tenant = await getMyTenant(supabase);
  if (!tenant) return { ok: false, error: 'No tenant' };

  // Layer 2 limit: maxCars (-1 = unlimited). RLS scopes the count to this tenant.
  const maxCars = num(tenant.features, 'maxCars', -1);
  if (maxCars !== -1) {
    const { count } = await supabase.from('cars').select('*', { count: 'exact', head: true });
    if ((count ?? 0) >= maxCars) return { ok: false, error: `LIMIT_MAX_CARS:${maxCars}` };
  }

  const d = parsed.data;
  // Layer 2 limit: maxImagesPerCar (-1 = unlimited).
  const maxImg = num(tenant.features, 'maxImagesPerCar', 5);
  if (maxImg !== -1 && d.images.length > maxImg) return { ok: false, error: `LIMIT_MAX_IMAGES:${maxImg}` };

  // Use the client-supplied id (storage uploads already used {tenant}/cars/{id}/).
  const row = { tenant_id: tenant.tenantId, ...mapFormToRow(d), slug: slugify(d.brand, d.model, d.year), ...(d.id ? { id: d.id } : {}) };

  let ins = await supabase.from('cars').insert(row).select('id').single();
  if (ins.error && /duplicate|unique/i.test(ins.error.message)) {
    row.slug = `${row.slug}-${Date.now().toString(36).slice(-4)}`;
    ins = await supabase.from('cars').insert(row).select('id').single();
  }
  if (ins.error || !ins.data) return { ok: false, error: ins.error?.message ?? 'Insert failed' };

  await upsertContent(supabase, ins.data.id, d);
  revalidate();
  return { ok: true, id: ins.data.id };
}

// ─── Update car ───────────────────────────────────────────────────────────────
export async function updateCar(input: { id: string; values: CarFormValues }): Promise<ActionResult> {
  const idOk = z.string().uuid().safeParse(input.id);
  if (!idOk.success) return { ok: false, error: 'Invalid id' };
  const parsed = carFormSchema.safeParse(input.values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  // Layer 2 limit: maxImagesPerCar.
  const tenant = await getMyTenant(supabase);
  const maxImg = num(tenant?.features ?? {}, 'maxImagesPerCar', 5);
  if (maxImg !== -1 && parsed.data.images.length > maxImg) return { ok: false, error: `LIMIT_MAX_IMAGES:${maxImg}` };

  const { error } = await supabase.from('cars').update(mapFormToRow(parsed.data)).eq('id', input.id);
  if (error) return { ok: false, error: error.message };

  await upsertContent(supabase, input.id, parsed.data);
  revalidate();
  return { ok: true };
}

const idSchema = z.string().uuid();
const idsSchema = z.array(z.string().uuid()).min(1).max(200);

function revalidate() {
  revalidatePath('/dashboard/cars');
  revalidatePath('/dashboard');
}

// ─── Toggle availability (single) ────────────────────────────────────────────
export async function toggleAvailable(input: { id: string; value: boolean }): Promise<ActionResult> {
  const parsed = z.object({ id: idSchema, value: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  // Keep status coherent: hiding a car that was 'available' → no status change;
  // status stays the richer field, available is the public-visibility switch.
  const { error } = await supabase
    .from('cars')
    .update({ available: parsed.data.value })
    .eq('id', parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

// ─── Toggle featured (single) ────────────────────────────────────────────────
export async function toggleFeatured(input: { id: string; value: boolean }): Promise<ActionResult> {
  const parsed = z.object({ id: idSchema, value: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('cars')
    .update({ is_featured: parsed.data.value })
    .eq('id', parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

// ─── Set status (available/sold/reserved) ────────────────────────────────────
export async function setCarStatus(input: { id: string; status: CarStatus }): Promise<ActionResult> {
  const parsed = z.object({ id: idSchema, status: z.enum(CAR_STATUSES) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  // Status drives availability sensibly: only 'available' can be publicly shown;
  // sold/reserved force available=false so the storefront hides them.
  const available = parsed.data.status === 'available';
  const { error } = await supabase
    .from('cars')
    .update({ status: parsed.data.status, available })
    .eq('id', parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

// ─── Delete (single) ──────────────────────────────────────────────────────────
export async function deleteCar(input: { id: string }): Promise<ActionResult> {
  const parsed = z.object({ id: idSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  // car_content cascades via FK; RLS delete policy requires admin/owner.
  const { error } = await supabase.from('cars').delete().eq('id', parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

// ─── Bulk actions (Task 7) ────────────────────────────────────────────────────
export async function bulkSetAvailable(input: { ids: string[]; value: boolean }): Promise<ActionResult> {
  const parsed = z.object({ ids: idsSchema, value: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('cars')
    .update({ available: parsed.data.value })
    .in('id', parsed.data.ids);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function bulkSetFeatured(input: { ids: string[]; value: boolean }): Promise<ActionResult> {
  const parsed = z.object({ ids: idsSchema, value: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('cars')
    .update({ is_featured: parsed.data.value })
    .in('id', parsed.data.ids);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function bulkDelete(input: { ids: string[] }): Promise<ActionResult> {
  const parsed = z.object({ ids: idsSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('cars').delete().in('id', parsed.data.ids);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

// ─── Quick price edit (single row) ────────────────────────────────────────────
const priceField = z.number().nonnegative().nullable().optional();
export async function updateCarPrice(input: {
  id: string;
  price_total?: number | null;
  price_daily?: number | null;
  price_monthly?: number | null;
}): Promise<ActionResult> {
  const parsed = z
    .object({ id: idSchema, price_total: priceField, price_daily: priceField, price_monthly: priceField })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const { id, ...rest } = parsed.data;
  // Only patch keys that were actually provided.
  const patch: { price_total?: number | null; price_daily?: number | null; price_monthly?: number | null } = {};
  for (const k of ['price_total', 'price_daily', 'price_monthly'] as const) {
    if (input[k] !== undefined) patch[k] = rest[k] ?? null;
  }
  if (Object.keys(patch).length === 0) return { ok: true };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('cars').update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

// ─── Bulk price adjustment ────────────────────────────────────────────────────
// Per-car, the adjusted field is chosen by listing_type:
//   sale|both → price_total   (the active sale price; price_old is NOT touched)
//   rent|both → price_daily    (the daily rate)
// Cars whose relevant field is null are skipped (the price "doesn't apply").
// New values are clamped at 0 and rounded to whole units.
export async function bulkAdjustPrice(input: {
  ids: string[];
  mode: 'amount' | 'percent';
  direction: 'increase' | 'decrease';
  value: number;
}): Promise<ActionResult & { updated?: number }> {
  const parsed = z
    .object({
      ids: idsSchema,
      mode: z.enum(['amount', 'percent']),
      direction: z.enum(['increase', 'decrease']),
      value: z.number().positive(),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };
  const { ids, mode, direction, value } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data: cars, error: readErr } = await supabase
    .from('cars')
    .select('id, listing_type, price_total, price_daily')
    .in('id', ids);
  if (readErr) return { ok: false, error: readErr.message };

  const sign = direction === 'increase' ? 1 : -1;
  const apply = (current: number) => {
    const next =
      mode === 'amount' ? current + sign * value : current * (1 + (sign * value) / 100);
    return Math.max(0, Math.round(next));
  };

  let updated = 0;
  for (const car of cars ?? []) {
    const patch: { price_total?: number; price_daily?: number } = {};
    const isSale = car.listing_type === 'sale' || car.listing_type === 'both';
    const isRent = car.listing_type === 'rent' || car.listing_type === 'both';
    if (isSale && car.price_total != null) patch.price_total = apply(car.price_total);
    if (isRent && car.price_daily != null) patch.price_daily = apply(car.price_daily);
    if (Object.keys(patch).length === 0) continue;
    const { error } = await supabase.from('cars').update(patch).eq('id', car.id);
    if (error) return { ok: false, error: error.message };
    updated++;
  }
  revalidate();
  return { ok: true, updated };
}
