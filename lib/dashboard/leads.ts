// lib/dashboard/leads.ts — dashboard-side lead/booking reads.
// AUTHENTICATED server client: RLS ("leads: select own tenant" → my_tenant_id())
// scopes rows to the logged-in user's tenant automatically. anon has no read
// policy on leads, so this is the only surface that can list them.

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';

export type LeadCar = Pick<Tables<'cars'>, 'id' | 'brand' | 'model' | 'year' | 'slug'>;
export type DashLead = Tables<'leads'> & { car: LeadCar | null };

export async function getMyTenantLeads(): Promise<DashLead[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*, car:cars(id, brand, model, year, slug)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DashLead[];
}

export function leadStats(leads: Pick<Tables<'leads'>, 'status'>[]) {
  const stat = (s: string) => leads.filter((l) => (l.status ?? 'new') === s).length;
  const isNew = stat('new');
  return {
    total: leads.length,
    new: isNew,
    contacted: stat('contacted'),
    closed: stat('closed'),
    // "handled" = anything the dealer has already actioned (contacted or closed)
    handled: leads.length - isNew,
  };
}
