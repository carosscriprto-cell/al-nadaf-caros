export type FaqItemId =
  | 'documents'
  | 'minimum_age'
  | 'rental_included'
  | 'modify_cancel'
  | 'delivery_pickup'
  | 'late_return'
  | 'booking_advance'
  | 'payment_methods'
  | 'airport_pickup'
  | 'booking_cancellation';

export type FaqGroup =
  | 'home'
  | 'about'
  | 'contact'
  | 'global'
  | 'page';

function uniqueFaq(items: FaqItemId[]) {
  return Array.from(new Set(items));
}

export const globalFaq: FaqItemId[] = [
  'booking_advance',
  'payment_methods',
  'airport_pickup',
  'booking_cancellation',
];

export const homeFaq: FaqItemId[] = [
  'documents',
  'minimum_age',
  'rental_included',
  'modify_cancel',
  'delivery_pickup',
  'late_return',
];

export const aboutFaq: FaqItemId[] = uniqueFaq([
  'documents',
  'delivery_pickup',
  ...globalFaq,
]);

export const contactFaq: FaqItemId[] = uniqueFaq(globalFaq);

export const faqGroups: Record<FaqGroup, FaqItemId[]> = {
  home: homeFaq,
  about: aboutFaq,
  contact: contactFaq,
  global: globalFaq,
  page: globalFaq,
};
