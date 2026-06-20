// lib/leads/intents.ts — which lead-capture intents a car offers.
// Gated by the car's listing_type AND the tenant's features, so a rental-only
// car never shows "buy/viewing" and a sale-only car never shows "book period".

import type { Car } from '@/types/vehicles';
import { getListingCapabilities } from '@/lib/vehicles/listingType';
import type { TenantFeatures } from '@/lib/tenant/features';

// 'booking' is the existing rental WIZARD (a route, not the capture form).
// The other three open the short capture form.
export type LeadIntent = 'availability' | 'viewing' | 'purchase' | 'booking';

// Intents that open the capture modal (vs. 'booking', which links to /booking).
export const FORM_INTENTS: readonly LeadIntent[] = ['availability', 'viewing', 'purchase'];

export function intentOpensForm(intent: LeadIntent): boolean {
  return FORM_INTENTS.includes(intent);
}

// Ordered list of applicable intents for a car under the tenant's features.
//   sale  → purchase, viewing, availability
//   rental→ booking, availability
//   both  → purchase, viewing, booking, availability
export function intentsForCar(car: Car, f: TenantFeatures): LeadIntent[] {
  const { canRent, canBuy } = getListingCapabilities(car);
  const out: LeadIntent[] = [];
  if (canBuy && f.enableSellCar) out.push('purchase', 'viewing');
  if (canRent && f.enableRental) out.push('booking');
  out.push('availability'); // relevant for both sale and rental
  return out;
}

// The single most important CTA for a compact surface (the car card).
export function primaryIntent(intents: LeadIntent[]): LeadIntent {
  if (intents.includes('purchase')) return 'purchase';
  if (intents.includes('booking')) return 'booking';
  return 'availability';
}
