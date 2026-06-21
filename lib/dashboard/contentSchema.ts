// lib/dashboard/contentSchema.ts — plain module for the Site-tab Content editor
// shape + validation. Bilingual text overrides for the static sections; every
// field is a (possibly empty) string — empty = "use the static default".

import { z } from 'zod';
import { WHY_ITEMS, HOW_STEPS } from '@/lib/tenant/content';

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

export const contentSchema = z.object({
  whyChooseUs: z.object({ en: sectionSchema(WHY_ITEMS), ar: sectionSchema(WHY_ITEMS) }),
  howItWorks: z.object({ en: sectionSchema(HOW_STEPS), ar: sectionSchema(HOW_STEPS) }),
  about: z.object({ en: aboutSchema, ar: aboutSchema }),
});

export type ContentValues = z.infer<typeof contentSchema>;
export type SectionValues = ContentValues['whyChooseUs']['en'];
export type AboutValues = ContentValues['about']['en'];

// True if the editor holds ANY non-empty text (else we store null → full fallback).
export function hasAnyContent(d: ContentValues): boolean {
  const strs: string[] = [];
  for (const sec of [d.whyChooseUs, d.howItWorks]) {
    for (const loc of ['en', 'ar'] as const) {
      strs.push(sec[loc].title, sec[loc].description);
      for (const it of sec[loc].items) strs.push(it.title, it.text);
    }
  }
  for (const loc of ['en', 'ar'] as const) strs.push(d.about[loc].heading, d.about[loc].body);
  return strs.some((s) => s.trim().length > 0);
}
