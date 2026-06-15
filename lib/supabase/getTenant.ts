// lib/supabase/getTenant.ts
// ─────────────────────────────────────────────────────────────
// Tenant resolution — P4: runtime, from the request host.
// The middleware resolves host → tenant_id and forwards it as the
// `x-tenant-id` request header (see lib/tenant/resolveTenant.ts +
// middleware.ts). Here we just read that header.
// ─────────────────────────────────────────────────────────────

import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { createPublicServerClient } from './client';
import { parseTenantFeatures, type TenantFeatures } from '@/lib/tenant/features';

// ─── Current tenant id (from the resolved request header) ─────
// Async because next/headers is async in this Next version. Wrapped in
// cache() so repeated calls within one request share a single read.

export const getTenantId = cache(async (): Promise<string> => {
  const h = await headers();
  const id = h.get('x-tenant-id');
  if (!id) {
    // Host did not resolve to an active tenant — render a 404 instead of
    // crashing. (Middleware deletes any spoofed inbound x-tenant-id.)
    notFound();
  }
  return id;
});

// ─── Cached tenant data ───────────────────────────────────────
// cache() ensures a single fetch per request even though getTenantConfig()
// is called from the layout + multiple components.

export const getTenantConfig = cache(async () => {
  const tenantId = await getTenantId();
  const supabase = createPublicServerClient();

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .eq('active', true)
    .single();

  if (error || !data) {
    notFound();
  }

  return data;
});

// Parsed feature flags for the current storefront tenant (anon, RLS-scoped).
export const getStorefrontFeatures = cache(async (): Promise<TenantFeatures> => {
  const tenant = await getTenantConfig();
  return parseTenantFeatures(tenant.features);
});
