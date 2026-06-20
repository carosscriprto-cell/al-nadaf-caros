// app/robots.txt/route.ts — per-tenant robots, resolved from the request host.
// Middleware runs for /robots.txt (not an excluded static extension) and 404s
// unknown hosts, so this only serves resolved tenants. Points crawlers at the
// tenant's own sitemap. Dynamic: never statically cached across tenants.

import { getRequestOrigin } from '@/lib/seo/host';

export const dynamic = 'force-dynamic';

export async function GET() {
  const origin = await getRequestOrigin();
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /dashboard',
    'Disallow: /auth',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
