// lib/supabase/brands.server.ts
// ─────────────────────────────────────────────────────────────
// Server-side read of the GLOBAL car_brands reference list (E1).
// car_brands is NOT tenant-scoped — anon SELECT is allowed by RLS — so the
// public client serves both the storefront (BrandShowcase) and the dashboard
// car form. This is the ONLY place brands are listed; no component hardcodes a
// brand list anymore. cache() ⇒ one query per request.
// ─────────────────────────────────────────────────────────────

import { cache } from 'react';
import { createPublicServerClient } from './client';
import type { Tables } from './database.types';

export type CarBrand = Tables<'car_brands'>;

export const getCarBrands = cache(async (): Promise<CarBrand[]> => {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from('car_brands')
    .select('*')
    .order('name_en', { ascending: true });
  if (error || !data) return [];
  return data;
});
