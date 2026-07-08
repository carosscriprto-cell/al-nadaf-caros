// app/(site)/c/[carId]/route.ts
// Public QR short link: /c/{car_id} → 302 → /ar/fleet/{slug}.
// Printed QR codes encode the immutable car id, so they survive slug changes.
// Tenant comes from the x-tenant-id header set by middleware.ts (host → tenant);
// reads use the anon client so RLS applies. Unknown / unavailable cars dead-end
// with 404 — a sold car's printed code must not leak or redirect anywhere.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createPublicServerClient } from '@/lib/supabase/client';
import { parseTenantFeatures, storefrontListingTypes } from '@/lib/tenant/features';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ carId: string }> },
) {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) return new NextResponse(null, { status: 404 });

  const { carId } = await params;
  if (!UUID_RE.test(carId)) return new NextResponse(null, { status: 404 });

  const supabase = createPublicServerClient();

  // Mirror the storefront query layer: getCarBySlug also restricts single-type
  // tenants via storefrontListingTypes, so without this filter a QR could
  // redirect to a fleet page that 404s (e.g. a rent-only car on a sale-only
  // tenant). Inactive tenants dead-end here like unknown ones.
  const { data: tenant } = await supabase
    .from('tenants')
    .select('features')
    .eq('id', tenantId)
    .eq('active', true)
    .single();
  if (!tenant) return new NextResponse(null, { status: 404 });

  const types = storefrontListingTypes(parseTenantFeatures(tenant.features));

  let q = supabase
    .from('cars')
    .select('slug')
    .eq('id', carId)
    .eq('tenant_id', tenantId)
    .eq('available', true); // public storefront sees available cars only
  if (types) q = q.in('listing_type', types);
  const { data, error } = await q.single();

  if (error || !data?.slug) return new NextResponse(null, { status: 404 });

  // Relative redirect — stays on the tenant's own origin (custom domain or
  // subdomain), whatever host the QR was scanned against.
  return NextResponse.redirect(new URL(`/ar/fleet/${data.slug}`, request.url), 302);
}
