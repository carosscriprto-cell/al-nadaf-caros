// lib/dashboard/contentSchema.ts — plain module for the Site-tab Content editor
// shape + validation. Bilingual text overrides for the static sections; every
// field is a (possibly empty) string — empty = "use the static default".

import { z } from 'zod';
import { WHY_ITEMS, HOW_STEPS, MAX_FAQ } from '@/lib/tenant/content';

const itemSchema = z.object({
  title: z.string().max(120),
  text: z.string().max(400),
});

const sectionSchema = (n: number) =>
  z.object({
    title: z.string().max(160),
    description: z.string().max(400),
    items: z.array(itemSchema).length(n),
  });

const aboutSchema = z.object({
  heading: z.string().max(160),
  body: z.string().max(2000),
});

// B1-overridable banners. Every field is an empty-allowed string (empty = "use
// the static default"); parseTenantContent normalizes empties → undefined on read.
const heroSchema = z.object({
  badge: z.string().max(80),
  headline: z.string().max(160),
  subheadline: z.string().max(400),
});

const ctaSchema = z.object({
  title: z.string().max(160),
  desc: z.string().max(400),
  cta: z.string().max(80),
});

const faqRowSchema = z.object({
  q: z.string().max(200),
  a: z.string().max(1000),
});
// MAX_FAQ enforced here (server-side mirror of the UI cap); reused from content.ts.
const faqListSchema = z.array(faqRowSchema).max(MAX_FAQ, `Maximum ${MAX_FAQ} FAQ items`);

export const contentSchema = z.object({
  whyChooseUs: z.object({ en: sectionSchema(WHY_ITEMS), ar: sectionSchema(WHY_ITEMS) }),
  howItWorks: z.object({ en: sectionSchema(HOW_STEPS), ar: sectionSchema(HOW_STEPS) }),
  about: z.object({ en: aboutSchema, ar: aboutSchema }),
  hero: z.object({ en: heroSchema, ar: heroSchema }),
  financing: z.object({ en: ctaSchema, ar: ctaSchema }),
  finalCta: z.object({ en: ctaSchema, ar: ctaSchema }),
  faq: z.object({ en: faqListSchema, ar: faqListSchema }),
});

export type ContentValues = z.infer<typeof contentSchema>;
export type SectionValues = ContentValues['whyChooseUs']['en'];
export type AboutValues = ContentValues['about']['en'];
export type HeroValues = ContentValues['hero']['en'];
export type CtaValues = ContentValues['financing']['en'];
export type FaqRowValues = ContentValues['faq']['en'][number];

// True if the editor holds ANY non-empty text (else we store null → full fallback).
export function hasAnyContent(d: ContentValues): boolean {
  const strs: string[] = [];
  for (const sec of [d.whyChooseUs, d.howItWorks]) {
    for (const loc of ['en', 'ar'] as const) {
      strs.push(sec[loc].title, sec[loc].description);
      for (const it of sec[loc].items) strs.push(it.title, it.text);
    }
  }
  for (const loc of ['en', 'ar'] as const) {
    strs.push(d.about[loc].heading, d.about[loc].body);
    strs.push(d.hero[loc].badge, d.hero[loc].headline, d.hero[loc].subheadline);
    strs.push(d.financing[loc].title, d.financing[loc].desc, d.financing[loc].cta);
    strs.push(d.finalCta[loc].title, d.finalCta[loc].desc, d.finalCta[loc].cta);
    for (const row of d.faq[loc]) strs.push(row.q, row.a);
  }
  return strs.some((s) => s.trim().length > 0);
}
