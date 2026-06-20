// app/sitemap.xml/route.ts — per-tenant sitemap, resolved from the request host.
// Middleware sets x-tenant-id for this path (and 404s unknown hosts), so the
// car list is scoped to the resolved tenant. Lists both locales for static
// pages + each available car. Dynamic: regenerated per request (per tenant).

import { headers } from 'next/headers';
import { getRequestOrigin } from '@/lib/seo/host';
import { createPublicServerClient } from '@/lib/supabase/client';
import { getStorefrontFeatures } from '@/lib/supabase/getTenant';

export const dynamic = 'force-dynamic';

const LOCALES = ['en', 'ar'] as const;
// Storefront pages every tenant has (relative to /{locale}). /services is added
// conditionally (rental tenants only — see below); /rental & /sales were removed.
const STATIC_PATHS = ['', '/fleet', '/about', '/contact', '/faq', '/privacy', '/terms'];

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

type Entry = { loc: string; lastmod?: string };

export async function GET() {
  const origin = await getRequestOrigin();
  const h = await headers();
  const tenantId = h.get('x-tenant-id');

  // /services only exists for rental/hybrid tenants (gated route, P2.5-3a).
  const features = await getStorefrontFeatures();
  const paths = features.enableRental ? [...STATIC_PATHS, '/services'] : STATIC_PATHS;

  const entries: Entry[] = [];
  for (const locale of LOCALES) {
    for (const path of paths) {
      entries.push({ loc: `${origin}/${locale}${path}` });
    }
  }

  if (tenantId) {
    // anon, RLS-scoped; .eq is the tenant selector. Only public (available) cars.
    const supabase = createPublicServerClient();
    const { data: cars } = await supabase
      .from('cars')
      .select('slug, updated_at')
      .eq('tenant_id', tenantId)
      .eq('available', true);

    for (const car of cars ?? []) {
      const lastmod = car.updated_at ? car.updated_at.slice(0, 10) : undefined;
      for (const locale of LOCALES) {
        entries.push({ loc: `${origin}/${locale}/fleet/${car.slug}`, lastmod });
      }
    }
  }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries
      .map(
        (e) =>
          `  <url><loc>${xmlEscape(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`,
      )
      .join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
