// lib/supabase/getTenant.ts
// ─────────────────────────────────────────────────────────────
// Tenant resolution — المرحلة الحالية: env variable (Option A)
// قابل للتوسع لاحقاً لـ domain/subdomain (Option B)
// ─────────────────────────────────────────────────────────────

import { cache } from 'react';
import { createServerClient } from './client';

// ─── الـ tenant الحالي من env ─────────────────────────────────
// أضف في .env.local:
// NEXT_PUBLIC_TENANT_ID=your-tenant-uuid

export function getTenantId(): string {
  const id = process.env.NEXT_PUBLIC_TENANT_ID;
  if (!id) {
    throw new Error(
      'NEXT_PUBLIC_TENANT_ID is not set in .env.local'
    );
  }
  return id;
}

// ─── Cached tenant data ───────────────────────────────────────
// cache() من React يضمن استدعاء واحد فقط لكل request
// مهم جداً لأن getTenantConfig() تُستدعى من layout + components

export const getTenantConfig = cache(async () => {
  const tenantId = getTenantId();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .eq('active', true)
    .single();

  if (error || !data) {
    throw new Error(`Tenant not found: ${tenantId}`);
  }

  return data;
});

// ─── المستقبل — Option B (domain resolution) ─────────────────
// عندما تصبح multi-tenant، بدّل getTenantId() بهذا:
//
// import { headers } from 'next/headers';
//
// export async function getTenantIdFromDomain(): Promise<string> {
//   const headersList = await headers();
//   const host = headersList.get('host') ?? '';
//   const domain = host.split(':')[0]; // remove port
//
//   const supabase = createServerClient();
//   const { data } = await supabase
//     .from('tenants')
//     .select('id')
//     .or(`domain.eq.${domain},subdomain.eq.${domain.split('.')[0]}`)
//     .eq('active', true)
//     .single();
//
//   if (!data) throw new Error(`No tenant for domain: ${domain}`);
//   return data.id;
// }