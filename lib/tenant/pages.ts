// lib/tenant/pages.ts
// Per-tenant page/button toggles (Site tab, P2.5-4b). Parses the `tenants.pages`
// jsonb into a known shape with graceful defaults (everything ON) so existing
// tenants (null pages) behave exactly as before.

export type TenantPages = {
  about: boolean;            // /about page + its nav link
  leadAvailability: boolean; // "Check availability" capture button on cars
  leadViewing: boolean;      // "Book a viewing" capture button on cars
};

export const DEFAULT_PAGES: TenantPages = {
  about: true,
  leadAvailability: true,
  leadViewing: true,
};

export function parseTenantPages(raw: unknown): TenantPages {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const b = (k: keyof TenantPages) => (typeof r[k] === 'boolean' ? (r[k] as boolean) : DEFAULT_PAGES[k]);
  return {
    about: b('about'),
    leadAvailability: b('leadAvailability'),
    leadViewing: b('leadViewing'),
  };
}
