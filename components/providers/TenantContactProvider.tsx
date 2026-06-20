'use client';

// Per-tenant contact for storefront CLIENT components. The layout resolves the
// tenant's contact (resolveContact → tenant.whatsapp/phone/email with siteConfig
// fallbacks) server-side and seeds this context. WhatsApp deep-link buttons read
// the TENANT's number here — so a visitor on Dealer A's storefront messages
// Dealer A, not the platform's static number.

import { createContext, useContext } from 'react';
import { siteConfig } from '@/config';
import type { StorefrontContact } from '@/lib/tenant/branding';

const FALLBACK: StorefrontContact = {
  phone: siteConfig.contact.phone.raw,
  whatsapp: siteConfig.contact.whatsapp.raw,
  email: siteConfig.contact.email.primary,
  hours: {},
};

const TenantContactContext = createContext<StorefrontContact>(FALLBACK);

export function TenantContactProvider({
  value,
  children,
}: {
  value: StorefrontContact;
  children: React.ReactNode;
}) {
  return <TenantContactContext.Provider value={value}>{children}</TenantContactContext.Provider>;
}

export function useTenantContact(): StorefrontContact {
  return useContext(TenantContactContext);
}
