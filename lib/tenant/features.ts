// lib/tenant/features.ts
// Typed accessor for the per-tenant `tenants.features` jsonb. Parses the raw
// jsonb into a known shape with sensible defaults so the app never has to guess.

export type TenantFeatures = {
  maxCars: number; // -1 = unlimited
  maxImagesPerCar: number;
  enableSellCar: boolean;
  enableRental: boolean;
  enableFinancing: boolean;
  enableWhatsApp: boolean;
  enableVipDelivery: boolean;
  enableEmailContact: boolean;
  enablePhoneContact: boolean;
};

export const DEFAULT_FEATURES: TenantFeatures = {
  maxCars: -1,
  maxImagesPerCar: 5,
  enableSellCar: true,
  enableRental: true,
  enableFinancing: false,
  enableWhatsApp: true,
  enableVipDelivery: false,
  enableEmailContact: true,
  enablePhoneContact: true,
};

export function parseTenantFeatures(raw: unknown): TenantFeatures {
  const f = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const bool = (k: keyof TenantFeatures) => (typeof f[k] === 'boolean' ? (f[k] as boolean) : DEFAULT_FEATURES[k] as boolean);
  const num = (k: keyof TenantFeatures) => (typeof f[k] === 'number' ? (f[k] as number) : DEFAULT_FEATURES[k] as number);
  return {
    maxCars: num('maxCars'),
    maxImagesPerCar: num('maxImagesPerCar'),
    enableSellCar: bool('enableSellCar'),
    enableRental: bool('enableRental'),
    enableFinancing: bool('enableFinancing'),
    enableWhatsApp: bool('enableWhatsApp'),
    enableVipDelivery: bool('enableVipDelivery'),
    enableEmailContact: bool('enableEmailContact'),
    enablePhoneContact: bool('enablePhoneContact'),
  };
}

// Which listing types can this tenant create?
export function allowedListingTypes(f: TenantFeatures): ('sale' | 'rent')[] {
  const out: ('sale' | 'rent')[] = [];
  if (f.enableSellCar) out.push('sale');
  if (f.enableRental) out.push('rent');
  return out.length ? out : ['sale']; // fallback so the dealer is never fully blocked
}

// Is this a hybrid tenant (offers BOTH sale and rental)? Drives whether the
// public site shows a sale/rent type filter at all.
export function isHybridTenant(f: TenantFeatures): boolean {
  return f.enableSellCar && f.enableRental;
}

// Which listing_type rows the STOREFRONT should show. null = no restriction
// (hybrid). Single-type tenants only ever show their own type (+ 'both').
export function storefrontListingTypes(f: TenantFeatures): ('sale' | 'rent' | 'both')[] | null {
  if (isHybridTenant(f)) return null;
  if (f.enableRental && !f.enableSellCar) return ['rent', 'both'];
  if (f.enableSellCar && !f.enableRental) return ['sale', 'both'];
  return null; // neither flag → don't hide anything (fallback)
}
