'use client';

// Per-tenant section text for storefront CLIENT components. The layout parses
// tenants.content server-side and seeds this context (both locales); WhyChooseUs,
// HowItWorks, and the About page read it and render the tenant's text when set,
// else fall back to the static i18n default. EMPTY_CONTENT outside the provider.

import { createContext, useContext } from 'react';
import { EMPTY_CONTENT, type TenantContent } from '@/lib/tenant/content';

const TenantContentContext = createContext<TenantContent>(EMPTY_CONTENT);

export function TenantContentProvider({
  value,
  children,
}: {
  value: TenantContent;
  children: React.ReactNode;
}) {
  return <TenantContentContext.Provider value={value}>{children}</TenantContentContext.Provider>;
}

export function useTenantContent(): TenantContent {
  return useContext(TenantContentContext);
}
