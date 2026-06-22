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

// Storefront contact block — tenant row wins, else the static siteConfig default
// (so phone/whatsapp/email are never empty). address/hours are left undefined
// when unset so the consumer can fall back to its localized i18n copy.
export type StorefrontContact = {
  phone: string;
  whatsapp: string;
  email: string;
  addressEn?: string;
  addressAr?: string;
  hours: StorefrontHours;
  mapCenter?: [number, number]; // tenant's map center; undefined → siteConfig default
};

// tenants.map_center jsonb → [lat, lng]. Accepts { lat, lng } / { latitude,
// longitude } / [lat, lng]; anything else → undefined (caller falls back).
export function resolveMapCenter(raw: unknown): [number, number] | undefined {
  if (Array.isArray(raw) && typeof raw[0] === 'number' && typeof raw[1] === 'number') {
    return [raw[0], raw[1]];
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const lat = typeof o.lat === 'number' ? o.lat : typeof o.latitude === 'number' ? o.latitude : undefined;
    const lng = typeof o.lng === 'number' ? o.lng : typeof o.lon === 'number' ? o.lon
      : typeof o.longitude === 'number' ? o.longitude : undefined;
    if (lat !== undefined && lng !== undefined) return [lat, lng];
  }
  return undefined;
}

export function resolveContact(t: {
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address_en?: string | null;
  address_ar?: string | null;
  business_hours?: unknown;
  map_center?: unknown;
}): StorefrontContact {
  return {
    phone: str(t.phone) ?? siteConfig.contact.phone.raw,
    whatsapp: str(t.whatsapp) ?? siteConfig.contact.whatsapp.raw,
    email: str(t.email) ?? siteConfig.contact.email.primary,
    addressEn: str(t.address_en),
    addressAr: str(t.address_ar),
    hours: resolveBusinessHours(t.business_hours),
    mapCenter: resolveMapCenter(t.map_center),
  };
}
