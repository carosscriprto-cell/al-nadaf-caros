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

export type FaqGroup = 'home' | 'about' | 'contact' | 'global';

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

export const aboutFaq: FaqItemId[] = [
  'documents',
  'delivery_pickup',
  ...globalFaq,
];

export const contactFaq: FaqItemId[] = globalFaq;

export const faqGroups: Record<FaqGroup, FaqItemId[]> = {
  home: homeFaq,
  about: aboutFaq,
  contact: contactFaq,
  global: globalFaq,
};
