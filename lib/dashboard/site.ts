// lib/dashboard/site.ts — Site-tab read mapping. Reuses getMyTenantSettings
// (RLS-scoped tenant + role); maps the tenant row → the SiteForm value shape.

import type { DashTenant } from './settings';
import type { SiteValues } from './siteSchema';
import type { ContentValues, SectionValues } from './contentSchema';
import { parseTenantPages } from '@/lib/tenant/pages';
import { parseSections } from '@/lib/tenant/sections';
import { parseTenantContent, WHY_ITEMS, HOW_STEPS, type SectionLocale } from '@/lib/tenant/content';

export function tenantToSiteValues(t: DashTenant): SiteValues {
  return {
    pages: parseTenantPages(t.pages),
    // Normalized to the full canonical list (order preserved, missing appended).
    sections: parseSections(t.sections),
  };
}

// Parsed tenant.content → the Content editor's value shape (all strings, fixed
// item arrays). Empty strings render as the static i18n default on the storefront.
function sectionToForm(s: SectionLocale, n: number): SectionValues {
  return {
    title: s.title ?? '',
    description: s.description ?? '',
    items: Array.from({ length: n }, (_, i) => ({
      title: s.items?.[i]?.title ?? '',
      text: s.items?.[i]?.text ?? '',
    })),
  };
}

export function tenantToContentValues(t: DashTenant): ContentValues {
  const c = parseTenantContent(t.content);
  return {
    whyChooseUs: { en: sectionToForm(c.whyChooseUs.en, WHY_ITEMS), ar: sectionToForm(c.whyChooseUs.ar, WHY_ITEMS) },
    howItWorks: { en: sectionToForm(c.howItWorks.en, HOW_STEPS), ar: sectionToForm(c.howItWorks.ar, HOW_STEPS) },
    about: {
      en: { heading: c.about.en.heading ?? '', body: c.about.en.body ?? '' },
      ar: { heading: c.about.ar.heading ?? '', body: c.about.ar.body ?? '' },
    },
  };
}
