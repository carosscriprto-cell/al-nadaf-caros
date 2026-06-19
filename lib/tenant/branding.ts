// lib/tenant/branding.ts
// Resolves white-label storefront fields from the tenant row jsonb, falling back
// to the static siteConfig defaults — same "tenant overrides default" pattern as
// colors/logo (P4 layout). Server-safe (no 'use client'); used by the layout +
// contact page to feed Footer/Contact.

import { siteConfig } from '@/config';

export type StorefrontSocial = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
};

export type StorefrontHours = {
  weekdays?: string;
  weekends?: string;
};

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
}
const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

// Per-key: tenant value wins, else the siteConfig default (so a dealer that
// hasn't set socials still shows the platform defaults).
export function resolveSocial(raw: unknown): StorefrontSocial {
  const t = asRecord(raw);
  return {
    facebook: str(t.facebook) ?? siteConfig.social.facebook,
    instagram: str(t.instagram) ?? siteConfig.social.instagram,
    twitter: str(t.twitter) ?? siteConfig.social.twitter,
    linkedin: str(t.linkedin) ?? siteConfig.social.linkedin,
  };
}

// Business hours: tenant value wins; undefined → the consumer falls back to its
// localized i18n default.
export function resolveBusinessHours(raw: unknown): StorefrontHours {
  const t = asRecord(raw);
  return { weekdays: str(t.weekdays), weekends: str(t.weekends) };
}
