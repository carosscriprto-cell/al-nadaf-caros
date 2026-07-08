// lib/tenant/publicOrigin.ts
// Canonical public origin for a tenant's storefront — the base URL that QR
// short links (and anything else printed/shared off-site) should point at.

/**
 * Builds the public origin for a tenant, mirroring the resolution order in
 * `resolveTenant.ts` (custom domain → subdomain under the root domain → slug):
 *
 * 1. `domain` set → `https://{domain}` (the exact stored host).
 * 2. `NEXT_PUBLIC_ROOT_DOMAIN` set → `https://{subdomain ?? slug}.{root}`.
 * 3. Otherwise (local dev, no root domain) → `http://{slug}.lvh.me:3000`.
 */
export function tenantPublicOrigin(t: {
  domain: string | null;
  subdomain: string | null;
  slug: string;
}): string {
  if (t.domain) return `https://${t.domain}`;

  // Same env sanitization as resolveTenant.ts (ROOT_DOMAIN).
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? '').toLowerCase().trim();
  if (root) return `https://${t.subdomain ?? t.slug}.${root}`;

  return `http://${t.slug}.lvh.me:3000`;
}
