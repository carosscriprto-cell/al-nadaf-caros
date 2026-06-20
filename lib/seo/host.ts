// lib/seo/host.ts
// Resolves the absolute origin of the CURRENT request (per-tenant host) so SEO
// output — canonical URLs, sitemap/robots, JSON-LD — points at the tenant's own
// domain rather than the platform default. Server-only (reads request headers).

import { headers } from 'next/headers';
import { siteConfig } from '@/config';

export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  if (!host) return siteConfig.urls.website;
  const proto =
    h.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}
