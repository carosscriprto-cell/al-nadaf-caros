// lib/dashboard/cars.ts — dashboard-side car reads.
// Uses the AUTHENTICATED server client: RLS (my_tenant_id) scopes rows to the
// logged-in user's tenant automatically, and there is NO available=true filter —
// so the dashboard sees ALL of its cars (available, hidden/sold/reserved), unlike
// the anon storefront query layer.

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';
import { parseTenantFeatures, type TenantFeatures } from '@/lib/tenant/features';

export type TenantPlan = Tables<'tenants'>['plan'];

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
  return (await getMyTenantContext()).features;
}

// Tenant id + parsed features (+ plan) for the logged-in user (the form needs
// the id to build storage upload paths {tenant_id}/cars/{car_id}/; the overview
// reads plan + features.maxCars to show plan/usage).
export async function getMyTenantContext(): Promise<{
  tenantId: string | null;
  features: TenantFeatures;
  plan: TenantPlan;
  domain: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { tenantId: null, features: parseTenantFeatures(null), plan: 'starter', domain: null };
  const { data } = await supabase
    .from('tenant_users')
    .select('tenant_id, tenant:tenants(features, plan, domain)')
    .eq('user_id', user.id)
    .single();
  return {
    tenantId: data?.tenant_id ?? null,
    features: parseTenantFeatures(data?.tenant?.features),
    plan: (data?.tenant?.plan ?? 'starter') as TenantPlan,
    // Real custom-domain reality (tenants.domain column), not the plan preset.
    domain: data?.tenant?.domain ?? null,
  };
}

export function carStats(cars: DashCar[]) {
  const byStatus = (s: string) => cars.filter((c) => (c.status ?? 'available') === s).length;
  return {
    total: cars.length,
    available: byStatus('available'),      // status = available (sellable/rentable)
    sold: byStatus('sold'),
    reserved: byStatus('reserved'),
    hidden: cars.filter((c) => !c.available).length,  // visibility switch off
    featured: cars.filter((c) => c.is_featured).length,
  };
}

export type CarStats = ReturnType<typeof carStats>;
