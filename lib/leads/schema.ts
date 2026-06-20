// lib/leads/schema.ts — shared lead/booking vocabulary + validation.
// Used by the public submit action (storefront) and the dashboard actions.

import { z } from 'zod';

export const LEAD_TYPES = ['inquiry', 'booking', 'purchase', 'availability', 'viewing'] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_STATUSES = ['new', 'contacted', 'closed'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

// Public submission payload. tenant_id is NOT accepted from the client — the
// server resolves it from the request (x-tenant-id) so a visitor can't target
// another dealer. Strings are trimmed/length-bounded to keep PII rows sane.
export const leadSubmitSchema = z.object({
  type: z.enum(LEAD_TYPES).default('inquiry'),
  source: z.string().max(40).optional(),
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
  car_id: z.string().uuid().optional(),
  locale: z.enum(['ar', 'en']).optional(),
  rental_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rental_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pickup_location: z.string().trim().max(160).optional(),
});

export type LeadSubmitInput = z.infer<typeof leadSubmitSchema>;
