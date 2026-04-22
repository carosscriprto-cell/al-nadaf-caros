import type {
  CarContentEntry,
  CarContentLocale,
  CarContentMap,
} from './types';

const contentLoaders: Record<
  CarContentLocale,
  () => Promise<CarContentMap>
> = {
  ar: async () => (await import('./ar')).carContentAr,
  en: async () => (await import('./en')).carContentEn,
};

const contentCache = new Map<
  CarContentLocale,
  Promise<CarContentMap>
>();

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

export async function getCarContentMap(locale?: string) {
  const safeLocale = normalizeCarContentLocale(locale);

  if (!contentCache.has(safeLocale)) {
    contentCache.set(safeLocale, contentLoaders[safeLocale]());
  }

  return contentCache.get(safeLocale)!;
}

export async function getCarContent(
  slug: string,
  locale?: string
): Promise<CarContentEntry | undefined> {
  const contentMap = await getCarContentMap(locale);
  return contentMap[slug];
}
