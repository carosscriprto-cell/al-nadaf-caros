'use client';

// Per-tenant feature flags for storefront CLIENT components. The layout resolves
// the tenant's features server-side (getStorefrontFeatures) and seeds this
// context; client components (WhatsAppButton, VipDeliveryBadge, Footer, …) read
// them via useTenantFeatures() instead of the old GLOBAL static featureFlags.
// Falls back to DEFAULT_FEATURES so a component outside the provider still works.

import { createContext, useContext } from 'react';
import { DEFAULT_FEATURES, type TenantFeatures } from '@/lib/tenant/features';

const TenantFeaturesContext = createContext<TenantFeatures>(DEFAULT_FEATURES);

export function TenantFeaturesProvider({
  value,
  children,
}: {
  value: TenantFeatures;
  children: React.ReactNode;
}) {
  return <TenantFeaturesContext.Provider value={value}>{children}</TenantFeaturesContext.Provider>;
}

export function useTenantFeatures(): TenantFeatures {
  return useContext(TenantFeaturesContext);
}
