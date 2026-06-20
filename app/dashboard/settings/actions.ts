'use server';

// app/dashboard/settings/actions.ts — tenant settings mutation.
// Runs via the AUTHENTICATED server client. The tenants UPDATE policy is
// OWNER-ONLY (id = my_tenant_id() AND role = owner), so RLS is the real guard.
// Because a non-owner UPDATE silently affects 0 rows (USING fails, no error),
// we ALSO check the role explicitly here to return a clear message.
//
// These columns feed P4 storefront theming/SEO live (layout reads color_*,
// logo_url, favicon_url, og_image_url, seo_*), so we revalidate the storefront.

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { settingsSchema, type SettingsValues } from '@/lib/dashboard/settingsSchema';
import type { ActionResult } from '@/app/dashboard/cars/types';

const orNull = (v?: string) => {
  const s = v?.trim();
  return s ? s : null;
};

export async function updateTenantSettings(values: SettingsValues): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(values);
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
  const row = {
    name: d.name.trim(),
    name_ar: orNull(d.name_ar),
    whatsapp: orNull(d.whatsapp),
    phone: orNull(d.phone),
    email: orNull(d.email),
    address_en: orNull(d.address_en),
    address_ar: orNull(d.address_ar),
    color_primary: d.color_primary,
    color_secondary: d.color_secondary,
    color_accent: d.color_accent,
    logo_url: orNull(d.logo_url),
    favicon_url: orNull(d.favicon_url),
    og_image_url: orNull(d.og_image_url),
    seo_title_en: orNull(d.seo_title_en),
    seo_title_ar: orNull(d.seo_title_ar),
    seo_desc_en: orNull(d.seo_desc_en),
    seo_desc_ar: orNull(d.seo_desc_ar),
    business_hours: {
      weekdays: orNull(d.business_hours.weekdays),
      weekends: orNull(d.business_hours.weekends),
    },
    social: {
      facebook: orNull(d.social.facebook),
      instagram: orNull(d.social.instagram),
      twitter: orNull(d.social.twitter),
      linkedin: orNull(d.social.linkedin),
    },
    // Ordered show/hide for storefront home sections (P6).
    sections: d.sections ?? null,
    updated_at: new Date().toISOString(),
  };

  // RLS scopes the write to the owner's own tenant; .eq is a belt-and-braces
  // selector. Update without RETURNING avoids needing extra read perms.
  const { error } = await supabase.from('tenants').update(row).eq('id', membership.tenant_id);
  if (error) return { ok: false, error: error.message };

  // Dashboard + storefront both read the tenant row.
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');
  revalidatePath('/', 'layout'); // storefront theming/SEO (P4 layout)
  return { ok: true };
}
