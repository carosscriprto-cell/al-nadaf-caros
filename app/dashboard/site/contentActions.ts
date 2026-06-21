'use server';

// app/dashboard/site/contentActions.ts — per-tenant section content mutation.
// Owner-only (tenants UPDATE policy is owner-gated; we also check the role for a
// clear message). Stores the bilingual text overrides in tenants.content; the
// storefront reads it live (with static fallbacks), so we revalidate it.

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { contentSchema, hasAnyContent, type ContentValues } from '@/lib/dashboard/contentSchema';
import type { ActionResult } from '@/app/dashboard/cars/types';

export async function updateTenantContent(values: ContentValues): Promise<ActionResult> {
  const parsed = contentSchema.safeParse(values);
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

  // All-empty → store null so the storefront fully falls back to static copy.
  const payload = hasAnyContent(parsed.data) ? parsed.data : null;

  const { error } = await supabase
    .from('tenants')
    .update({ content: payload, updated_at: new Date().toISOString() })
    .eq('id', membership.tenant_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/site');
  revalidatePath('/', 'layout'); // storefront reads tenant.content
  return { ok: true };
}
