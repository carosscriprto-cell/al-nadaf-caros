'use client';

// Per-tenant page/button toggles for storefront CLIENT components. The layout
// resolves the tenant's pages config (parseTenantPages) server-side and seeds
// this context; Navbar + SmartLeadButtons read it to show/hide the About link
// and the availability/viewing capture buttons. Falls back to DEFAULT_PAGES
// (all on) outside the provider.

import { createContext, useContext } from 'react';
import { DEFAULT_PAGES, type TenantPages } from '@/lib/tenant/pages';

const TenantPagesContext = createContext<TenantPages>(DEFAULT_PAGES);

export function TenantPagesProvider({
  value,
  children,
}: {
  value: TenantPages;
  children: React.ReactNode;
}) {
  return <TenantPagesContext.Provider value={value}>{children}</TenantPagesContext.Provider>;
}

export function useTenantPages(): TenantPages {
  return useContext(TenantPagesContext);
}
