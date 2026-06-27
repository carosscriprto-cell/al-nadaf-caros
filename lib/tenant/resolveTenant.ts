// lib/tenant/resolveTenant.ts
// ─────────────────────────────────────────────────────────────────────────────
// Runtime tenant resolution from the request host. Edge-safe: talks to Supabase
// via PostgREST RPC over fetch (no supabase-js / ws in the middleware bundle).
//
// Resolution order (per P4 spec):
//   1. Subdomain  → public.get_tenant_id_by_slug(label)     [primary]
//   2. Full host  → public.get_tenant_id_by_domain(host)    [custom domain;
//                   the SQL also matches the `subdomain` column as a fallback]
//   3. DEFAULT_TENANT_SLUG → get_tenant_id_by_slug          [local/apex dev only]
//
// Works identically for local lvh.me subdomains (dealer1.lvh.me), a future
// wildcard (*.caros.com), and custom domains — only the host string differs.
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Configurable root domain (e.g. "caros.com" in prod). When set, the tenant
// subdomain is the host with the root domain stripped off — so it works for any
// base-domain label depth. Optional: when UNSET we degrade to the legacy
// 2-label heuristic so local dev (dealer1.lvh.me) keeps working with no env.
const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? '').toLowerCase().trim();

// Legacy fallback: hostnames whose last N labels are the *base* domain (no tenant
// subdomain). lvh.me → 2; localhost → 1. Only used when ROOT_DOMAIN is unset.
const BASE_DOMAIN_LABELS = 2;

export function extractSubdomain(host: string): string | null {
  const hostname = (host.split(':')[0] ?? '').toLowerCase().trim();
  if (!hostname || hostname === 'localhost') return null;

  // Bare IP (e.g. 127.0.0.1) has no subdomain concept.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return null;

  // Platform host: ANY *.vercel.app (incl. multi-label preview hosts like
  // project-git-branch-team.vercel.app) is NOT a tenant subdomain — the project
  // name must not be read as a tenant. → null so the bare Vercel URL falls back
  // to DEFAULT_TENANT_SLUG instead of 404.
  if (hostname === 'vercel.app' || hostname.endsWith('.vercel.app')) return null;

  // Configured root domain → subdomain = host minus the root domain.
  if (ROOT_DOMAIN) {
    // Apex and www → no tenant subdomain (domain match / DEFAULT fallback).
    if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return null;
    if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
      // Strip ".<root>"; the leading label is the tenant subdomain.
      const label = hostname.slice(0, -(ROOT_DOMAIN.length + 1)).split('.')[0];
      if (!label || label === 'www') return null;
      return label;
    }
    // Host is NOT under the root domain → a tenant custom domain. Treat as having
    // no subdomain so resolution matches the FULL host via get_tenant_id_by_domain.
    return null;
  }

  // Legacy label-count heuristic (ROOT_DOMAIN unset — local dev).
  const parts = hostname.split('.');
  if (parts.length <= BASE_DOMAIN_LABELS) return null; // apex (caros.com, lvh.me)

  const sub = parts[0];
  if (!sub || sub === 'www') return null;
  return sub;
}

async function rpc(fn: string, body: Record<string, unknown>): Promise<string | null> {
  if (!SUPABASE_URL || !ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Resolution is request-scoped and may change when a tenant's domain
      // changes; don't let the platform cache a stale host→tenant mapping.
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json(); // scalar uuid or null
    return typeof data === 'string' && data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

export async function resolveTenantId(host: string): Promise<string | null> {
  const hostname = (host.split(':')[0] ?? '').toLowerCase().trim();

  // 1. Subdomain → slug (primary)
  const sub = extractSubdomain(host);
  if (sub) {
    const bySlug = await rpc('get_tenant_id_by_slug', { p_slug: sub });
    if (bySlug) return bySlug;

    // An explicit subdomain that doesn't map to a tenant must NOT silently fall
    // back to the default tenant — that would serve dealer1's data on
    // bogus.lvh.me. Try a custom-domain match on the full host, then 404.
    const byDomain = await rpc('get_tenant_id_by_domain', { p_domain: hostname });
    return byDomain ?? null;
  }

  // 2. No subdomain → custom domain (or subdomain column) match on full host.
  if (hostname && hostname !== 'localhost') {
    const byDomain = await rpc('get_tenant_id_by_domain', { p_domain: hostname });
    if (byDomain) return byDomain;
  }

  // 3. Local/apex dev fallback — ONLY when there is no subdomain (plain
  //    localhost / apex). Lets local dev render a tenant without lvh.me.
  const fallbackSlug = process.env.DEFAULT_TENANT_SLUG;
  if (fallbackSlug) {
    const byFallback = await rpc('get_tenant_id_by_slug', { p_slug: fallbackSlug });
    if (byFallback) return byFallback;
  }

  return null;
}
