// lib/dashboard/site.ts — Site-tab read mapping. Reuses getMyTenantSettings
// (RLS-scoped tenant + role); maps the tenant row → the SiteForm value shape.

import type { DashTenant } from './settings';
import type { SiteValues } from './siteSchema';
import type { ContentValues, SectionValues, HeroValues, CtaValues, FaqRowValues, AboutValues } from './contentSchema';
import { parseTenantPages } from '@/lib/tenant/pages';
import { parseSections } from '@/lib/tenant/sections';
import {
  parseTenantContent,
  WHY_ITEMS,
  HOW_STEPS,
  type SectionLocale,
  type HeroLocale,
  type CtaLocale,
  type FaqEntry,
  type AboutLocale,
} from '@/lib/tenant/content';

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

function heroToForm(h: HeroLocale): HeroValues {
  return {
    badge: h.badge ?? '',
    headline: { line1: h.headline?.line1 ?? '', line2: h.headline?.line2 ?? '' },
    subheadline: h.subheadline ?? '',
  };
}

function ctaToForm(c: CtaLocale): CtaValues {
  return { title: c.title ?? '', desc: c.desc ?? '', cta: c.cta ?? '' };
}

function faqToForm(rows: FaqEntry[]): FaqRowValues[] {
  return rows.map((r) => ({ q: r.q ?? '', a: r.a ?? '' }));
}

function aboutToForm(a: AboutLocale): AboutValues {
  return {
    hero: {
      title: a.hero?.title ?? '',
      highlight: a.hero?.highlight ?? '',
      descPrimary: a.hero?.descPrimary ?? '',
      descSecondary: a.hero?.descSecondary ?? '',
    },
    experienceCard: {
      label: a.experienceCard?.label ?? '',
      title: a.experienceCard?.title ?? '',
      description: a.experienceCard?.description ?? '',
    },
    heading: a.heading ?? '',
    body: a.body ?? '',
    storyDescription: a.storyDescription ?? '',
    stats: (a.stats ?? []).map((s) => ({ value: s.value ?? '', label: s.label ?? '' })),
    numbers: { title: a.numbers?.title ?? '', description: a.numbers?.description ?? '' },
    locations: { title: a.locations?.title ?? '', description: a.locations?.description ?? '' },
  };
}

export function tenantToContentValues(t: DashTenant): ContentValues {
  const c = parseTenantContent(t.content);
  return {
    whyChooseUs: { en: sectionToForm(c.whyChooseUs.en, WHY_ITEMS), ar: sectionToForm(c.whyChooseUs.ar, WHY_ITEMS) },
    howItWorks: { en: sectionToForm(c.howItWorks.en, HOW_STEPS), ar: sectionToForm(c.howItWorks.ar, HOW_STEPS) },
    about: { en: aboutToForm(c.about.en), ar: aboutToForm(c.about.ar) },
    hero: { en: heroToForm(c.hero.en), ar: heroToForm(c.hero.ar) },
    financing: { en: ctaToForm(c.financing.en), ar: ctaToForm(c.financing.ar) },
    finalCta: { en: ctaToForm(c.finalCta.en), ar: ctaToForm(c.finalCta.ar) },
    faq: { en: faqToForm(c.faq.en), ar: faqToForm(c.faq.ar) },
  };
}
