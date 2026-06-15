// lib/dashboard/cars.ts — dashboard-side car reads.
// Uses the AUTHENTICATED server client: RLS (my_tenant_id) scopes rows to the
// logged-in user's tenant automatically, and there is NO available=true filter —
// so the dashboard sees ALL of its cars (available, hidden/sold/reserved), unlike
// the anon storefront query layer.

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';
import { parseTenantFeatures, type TenantFeatures } from '@/lib/tenant/features';

export type DashCar = Tables<'cars'>;
export type DashCarContent = Tables<'car_content'>;
export type DashCarWithContent = DashCar & { car_content: DashCarContent[] };

export async function getMyTenantCars(): Promise<DashCarWithContent[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('cars')
    .select('*, car_content(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DashCarWithContent[];
}

// Single car (RLS-scoped) with its bilingual content — for the edit page.
export async function getMyCarById(id: string): Promise<DashCarWithContent | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('cars').select('*, car_content(*)').eq('id', id).single();
  return (data as DashCarWithContent) ?? null;
}

// Parsed feature flags for the logged-in user's tenant.
export async function getMyTenantFeatures(): Promise<TenantFeatures> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return parseTenantFeatures(null);
  const { data } = await supabase
    .from('tenant_users')
    .select('tenant:tenants(features)')
    .eq('user_id', user.id)
    .single();
  return parseTenantFeatures(data?.tenant?.features);
}

export function carStats(cars: DashCar[]) {
  return {
    total: cars.length,
    available: cars.filter((c) => c.available).length,
    hidden: cars.filter((c) => !c.available).length,
    featured: cars.filter((c) => c.is_featured).length,
  };
}
