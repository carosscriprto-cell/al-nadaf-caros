// lib/dashboard/site.ts — Site-tab read mapping. Reuses getMyTenantSettings
// (RLS-scoped tenant + role); maps the tenant row → the SiteForm value shape.

import type { DashTenant } from './settings';
import type { SiteValues } from './siteSchema';
import { parseTenantPages } from '@/lib/tenant/pages';
import { parseSections } from '@/lib/tenant/sections';

export function tenantToSiteValues(t: DashTenant): SiteValues {
  return {
    pages: parseTenantPages(t.pages),
    // Normalized to the full canonical list (order preserved, missing appended).
    sections: parseSections(t.sections),
  };
}
