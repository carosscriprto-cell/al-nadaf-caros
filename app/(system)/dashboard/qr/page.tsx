// /dashboard/qr — per-car QR codes for showroom printing (feature-gated tool).
// Flag off → notFound(): the tool is invisible, not just hidden in the nav.

import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { parseTenantFeatures } from '@/lib/tenant/features';
import { tenantPublicOrigin } from '@/lib/tenant/publicOrigin';
import QrToolClient, { type QrCar } from '@/components/dashboard/qr/QrToolClient';

export default async function DashboardQrPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant:tenants(name, name_ar, slug, subdomain, domain, logo_url, features)')
    .eq('user_id', user.id)
    .single();

  const tenant = tenantUser?.tenant;
  if (!tenant) redirect('/auth/login');

  const features = parseTenantFeatures(tenant.features);
  if (!features.enableCarQr) notFound();

  // RLS (my_tenant_id) scopes this to the user's tenant; the dashboard sees ALL
  // cars (incl. hidden/sold) — the tool shows status so the dealer knows which
  // QR will dead-end publicly.
  const { data: cars } = await supabase
    .from('cars')
    .select('id, slug, brand, model, year, thumbnail, status, available')
    .order('created_at', { ascending: false });

  const origin = tenantPublicOrigin({
    domain: tenant.domain,
    subdomain: tenant.subdomain,
    slug: tenant.slug,
  });

  return (
    <QrToolClient
      cars={(cars ?? []) as QrCar[]}
      origin={origin}
      tenantName={tenant.name}
      tenantNameAr={tenant.name_ar}
      logoUrl={tenant.logo_url}
    />
  );
}
