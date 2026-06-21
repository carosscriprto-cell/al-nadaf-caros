// lib/dashboard/siteSchema.ts — plain (non-'use server') module for the Site-tab
// form shape + validation. Shared by the SiteForm and the site action.
// Covers the page/button toggles (tenants.pages) + the relocated home-sections
// order/visibility control (tenants.sections, moved here from Settings in 4b).

import { z } from 'zod';
import { HOME_SECTIONS } from '@/lib/tenant/sections';

export const pagesSchema = z.object({
  about: z.boolean(),
  leadAvailability: z.boolean(),
  leadViewing: z.boolean(),
});

// Ordered show/hide for storefront home sections (relocated from settingsSchema).
export const sectionItemSchema = z.object({
  key: z.enum([...HOME_SECTIONS] as [string, ...string[]]),
  enabled: z.boolean(),
});

export const siteSchema = z.object({
  pages: pagesSchema,
  sections: z.array(sectionItemSchema),
});

export type SiteValues = z.infer<typeof siteSchema>;
