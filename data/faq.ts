// data/faq.ts
// Type-aware default FAQ sets (H2b). The static FAQ defaults used to be a single
// rental-flavored set shown to every tenant. Now there are THREE sets — sale /
// rental / generic — and each storefront group resolves the right set by the
// tenant variant (same sale|rental|null logic as howItWorks / H2a). The HOME
// group's tenant override (content.faq, B1) still wins; the other groups
// (global/about/contact/page) have no override and use the default set directly.

export type FaqItemId =
  // shared / neutral (used by the generic set, reused by rental)
  | 'payment_methods'
  | 'delivery_pickup'
  | 'generic_browse'
  | 'generic_inspection'
  | 'generic_visit'
  | 'generic_contact'
  // rental set
  | 'documents'
  | 'minimum_age'
  | 'rental_included'
  | 'modify_cancel'
  | 'late_return'
  | 'booking_advance'
  | 'airport_pickup'
  | 'booking_cancellation'
  // sale set
  | 'sale_financing'
  | 'sale_inspection'
  | 'sale_warranty'
  | 'sale_test_drive'
  | 'sale_trade_in'
  | 'sale_ownership';

export type FaqGroup =
  | 'home'
  | 'about'
  | 'contact'
  | 'global'
  | 'page';

// 'generic' is the null-variant (hybrid / neither flag) — mirrors howItWorks
// where the absence of a single-type variant falls back to the neutral default.
export type FaqVariant = 'sale' | 'rental' | 'generic';

function uniqueFaq(items: FaqItemId[]) {
  return Array.from(new Set(items));
}

// ── RENTAL set (the previous behaviour, unchanged) ──────────────────────────
const rentalGlobal: FaqItemId[] = [
  'booking_advance',
  'payment_methods',
  'airport_pickup',
  'booking_cancellation',
];
const rentalHome: FaqItemId[] = [
  'documents',
  'minimum_age',
  'rental_included',
  'modify_cancel',
  'delivery_pickup',
  'late_return',
];
const rentalAbout = uniqueFaq(['documents', 'delivery_pickup', ...rentalGlobal]);
const rentalContact = uniqueFaq(rentalGlobal);

// ── SALE set (financing / inspection / warranty / ownership / trade-in / test drive) ─
const saleGlobal: FaqItemId[] = [
  'sale_financing',
  'sale_inspection',
  'sale_warranty',
  'sale_ownership',
];
const saleHome: FaqItemId[] = [
  'sale_financing',
  'sale_inspection',
  'sale_warranty',
  'sale_test_drive',
  'sale_trade_in',
  'sale_ownership',
];
const saleAbout = uniqueFaq(['sale_inspection', 'sale_test_drive', ...saleGlobal]);
const saleContact = uniqueFaq(saleGlobal);

// ── GENERIC set (hybrid / neither — neutral, fits both, no single-type concepts) ─
const genericGlobal: FaqItemId[] = [
  'payment_methods',
  'delivery_pickup',
  'generic_inspection',
  'generic_contact',
];
const genericHome: FaqItemId[] = [
  'generic_browse',
  'generic_inspection',
  'delivery_pickup',
  'payment_methods',
  'generic_visit',
  'generic_contact',
];
const genericAbout = uniqueFaq(['generic_inspection', 'generic_visit', ...genericGlobal]);
const genericContact = uniqueFaq(['payment_methods', 'delivery_pickup', 'generic_visit', 'generic_contact']);

const VARIANT_GROUPS: Record<FaqVariant, Record<FaqGroup, FaqItemId[]>> = {
  rental: {
    home: rentalHome,
    about: rentalAbout,
    contact: rentalContact,
    global: rentalGlobal,
    page: rentalGlobal,
  },
  sale: {
    home: saleHome,
    about: saleAbout,
    contact: saleContact,
    global: saleGlobal,
    page: saleGlobal,
  },
  generic: {
    home: genericHome,
    about: genericAbout,
    contact: genericContact,
    global: genericGlobal,
    page: genericGlobal,
  },
};

// Resolve the default Q&A ids for a group given the tenant variant. Used by the
// storefront FAQ for every group (home falls back to this only when there's no
// B1 override).
export function faqIdsFor(group: FaqGroup, variant: FaqVariant): FaqItemId[] {
  return VARIANT_GROUPS[variant][group];
}
