import type {
  CarContentEntry,
  CarContentLocale,
  CarContentMap,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Pure content helpers. As of Phase 3 the car content itself lives in Supabase
// (car_content table), fetched via lib/supabase/queries.server → mappers and
// passed to components as a `contentMap` prop. The static en/ar loaders that used
// to live here were removed with the static data — only locale normalisation and
// the generated-title fallback remain, both pure and data-free.
// ─────────────────────────────────────────────────────────────────────────────

export type { CarContentEntry, CarContentLocale, CarContentMap };

export function normalizeCarContentLocale(
  locale?: string
): CarContentLocale {
  return locale === 'ar' ? 'ar' : 'en';
}

export function getCarTitleFallback(car: {
  brand: string;
  model: string;
  year: number;
}) {
  return `${car.brand} ${car.model} ${car.year}`;
}
