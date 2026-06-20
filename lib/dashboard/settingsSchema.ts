// lib/dashboard/settingsSchema.ts — plain (non-'use server') module for the
// tenant-settings form shape + validation. Shared by the form and the action.

import { z } from 'zod';
import { HOME_SECTIONS } from '@/lib/tenant/sections';

// #rgb / #rrggbb hex colors (the storefront injects these as CSS variables).
const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Use a hex color like #3b82f6');

// Optional URL that also accepts '' (empty → cleared). Stored as null when blank.
const optUrl = z.string().trim().url('Enter a valid URL').max(500).optional().or(z.literal(''));
const optText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const businessHoursSchema = z.object({
  weekdays: optText(120),
  weekends: optText(120),
});

export const socialSchema = z.object({
  facebook: optUrl,
  instagram: optUrl,
  twitter: optUrl,
  linkedin: optUrl,
});

// Storefront home sections (P6): ordered show/hide. The form always submits the
// full normalized array; the storefront falls back to defaults when null.
export const sectionItemSchema = z.object({
  key: z.enum([...HOME_SECTIONS] as [string, ...string[]]),
  enabled: z.boolean(),
});

export const settingsSchema = z.object({
  // identity
  name: z.string().trim().min(1, 'Required').max(120),
  name_ar: optText(120),
  whatsapp: optText(40),
  phone: optText(40),
  email: z.string().trim().email('Invalid email').max(160).optional().or(z.literal('')),
  address_en: optText(300),
  address_ar: optText(300),
  // branding
  color_primary: hexColor,
  color_secondary: hexColor,
  color_accent: hexColor,
  logo_url: optUrl,
  favicon_url: optUrl,
  og_image_url: optUrl,
  // SEO
  seo_title_en: optText(160),
  seo_title_ar: optText(160),
  seo_desc_en: optText(320),
  seo_desc_ar: optText(320),
  // structured jsonb
  business_hours: businessHoursSchema,
  social: socialSchema,
  sections: z.array(sectionItemSchema).optional(),
});

export type SettingsValues = z.infer<typeof settingsSchema>;
