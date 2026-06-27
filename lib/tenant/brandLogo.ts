// lib/tenant/brandLogo.ts
// ─────────────────────────────────────────────────────────────
// SINGLE source of truth for resolving a car-brand logo (E3).
//
// Resolution:
//   1. car_brands.logo_url is set  → use it (manual override).
//   2. else                        → derive a URL from the slug using a FREE,
//                                     no-key, jsDelivr-hosted car-logos dataset.
//
// On image load error (slug not in the dataset) the UI MUST fall back to a
// lettered placeholder (see brandInitials + the BrandLogo component) so an
// unknown brand never renders a broken image.
//
// NO logo files are stored in Supabase storage. NO runtime API calls with keys.
// To switch CDN/dataset later, change CDN_BASE here — this is the only place.
// ─────────────────────────────────────────────────────────────

// filippofilip95/car-logos-dataset — stable, MIT, hosted on GitHub → served via
// jsDelivr's CDN. Pinned to @master; logos live under /logos/optimized/{slug}.png.
const CDN_BASE =
  'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized';

/**
 * Resolve a brand logo URL: manual override wins, else derived from the slug.
 * Returns null only when there is nothing to render from (empty slug + no
 * override) — callers then render the lettered placeholder.
 */
export function brandLogoUrl(slug: string, override?: string | null): string | null {
  const o = override?.trim();
  if (o) return o;
  const s = slug.trim().toLowerCase();
  if (!s) return null;
  return `${CDN_BASE}/${s}.png`;
}

/** Up to two uppercase initials for the lettered fallback avatar. */
export function brandInitials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}
