'use server';

// app/dashboard/site/actions.ts — Site management mutation (pages + sections).
// Runs via the AUTHENTICATED server client. The tenants UPDATE policy is
// OWNER-ONLY (id = my_tenant_id() AND role = owner) — RLS is the real guard; we
// also check the role here to return a clear message. The storefront reads
// tenant.pages/sections live, so we revalidate it.

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { siteSchema, type SiteValues } from '@/lib/dashboard/siteSchema';
import type { ActionResult } from '@/app/(system)/dashboard/cars/types';

export async function updateTenantSite(values: SiteValues): Promise<ActionResult> {
  const parsed = siteSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in' };

  const { data: membership } = await supabase
    .from('tenant_users')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single();
  if (!membership) return { ok: false, error: 'No tenant' };
  if (membership.role !== 'owner') return { ok: false, error: 'ONLY_OWNER' };

  const d = parsed.data;
  const { error } = await supabase
    .from('tenants')
    .update({ pages: d.pages, sections: d.sections, updated_at: new Date().toISOString() })
    .eq('id', membership.tenant_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/site');
  revalidatePath('/dashboard');
  revalidatePath('/', 'layout'); // storefront reads pages/sections (gating + home)
  return { ok: true };
}
