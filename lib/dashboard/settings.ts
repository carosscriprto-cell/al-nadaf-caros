// lib/dashboard/settings.ts — dashboard-side tenant-settings read.
// AUTHENTICATED server client: RLS ("tenant: select own") returns only the
// logged-in user's tenant. Also resolves the user's role — the tenants UPDATE
// policy is owner-only, so the form is read-only for non-owners.

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';
import type { SettingsValues } from './settingsSchema';
import { parseSections } from '@/lib/tenant/sections';

export type DashTenant = Tables<'tenants'>;
export type TenantRole = 'owner' | 'admin' | 'editor';

export async function getMyTenantSettings(): Promise<{
  tenant: DashTenant | null;
  role: TenantRole | null;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { tenant: null, role: null };

  const { data } = await supabase
    .from('tenant_users')
    .select('role, tenant:tenants(*)')
    .eq('user_id', user.id)
    .single();

  return {
    tenant: (data?.tenant as DashTenant) ?? null,
    role: (data?.role as TenantRole) ?? null,
  };
}

// Map a tenant row → the form's value shape (the form owns the editable subset).
export function tenantToFormValues(t: DashTenant): SettingsValues {
  const bh = (t.business_hours ?? {}) as Record<string, unknown>;
  const so = (t.social ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    name: t.name ?? '',
    name_ar: t.name_ar ?? '',
    whatsapp: t.whatsapp ?? '',
    phone: t.phone ?? '',
    email: t.email ?? '',
    address_en: t.address_en ?? '',
    address_ar: t.address_ar ?? '',
    color_primary: t.color_primary ?? '#000000',
    color_secondary: t.color_secondary ?? '#ffffff',
    color_accent: t.color_accent ?? '#3b82f6',
    logo_url: t.logo_url ?? '',
    favicon_url: t.favicon_url ?? '',
    og_image_url: t.og_image_url ?? '',
    seo_title_en: t.seo_title_en ?? '',
    seo_title_ar: t.seo_title_ar ?? '',
    seo_desc_en: t.seo_desc_en ?? '',
    seo_desc_ar: t.seo_desc_ar ?? '',
    business_hours: { weekdays: str(bh.weekdays), weekends: str(bh.weekends) },
    social: {
      facebook: str(so.facebook),
      instagram: str(so.instagram),
      twitter: str(so.twitter),
      linkedin: str(so.linkedin),
    },
    // Normalized to the full canonical list (order preserved, missing appended).
    sections: parseSections(t.sections),
  };
}
