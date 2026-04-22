import type Fuse from 'fuse.js';

import { createSearch } from './createSearch';
import { normalize } from './normalize';
import type {
  SearchIntent,
  SearchableCar,
  SearchVehiclesParams,
} from './types';

const CHEAP_INTENT_TERMS = [
  'cheap',
  'budget',
  'affordable',
  'low price',
  'رخيص',
  'اقتصادي',
];
const LUXURY_INTENT_TERMS = [
  'luxury',
  'expensive',
  'premium',
  'high end',
  'غالي',
  'فاخر',
];
const GENERIC_VEHICLE_TERMS = [
  'car',
  'cars',
  'vehicle',
  'vehicles',
  'سياره',
  'سيارات',
  'مركبه',
  'مركبات',
];

function includesIntent(
  normalizedQuery: string,
  terms: string[]
): boolean {
  return terms.some((term) =>
    normalizedQuery.includes(normalize(term))
  );
}

function detectIntent(normalizedQuery: string): SearchIntent {
  if (!normalizedQuery) {
    return 'default';
  }

  if (includesIntent(normalizedQuery, CHEAP_INTENT_TERMS)) {
    return 'cheap';
  }

  if (includesIntent(normalizedQuery, LUXURY_INTENT_TERMS)) {
    return 'luxury';
  }

  return 'default';
}

function stripTerms(
  normalizedQuery: string,
  terms: string[]
): string {
  const stripped = terms.reduce((result, term) => {
    const normalizedTerm = normalize(term);

    if (!normalizedTerm) {
      return result;
    }

    const termPattern = new RegExp(
      `(^|\\s)${normalizedTerm}(?=\\s|$)`,
      'g'
    );

    return result.replace(termPattern, ' ');
  }, normalizedQuery);

  return normalize(stripped);
}

function getComparablePrice(car: SearchableCar): number {
  return (
    car.pricing.daily ??
    car.pricing.total ??
    Number.MAX_SAFE_INTEGER
  );
}

function getBaseBrowseRank(car: SearchableCar): number {
  return (
    Number(Boolean(car.isFeatured)) * 1000 +
    Number(Boolean(car.isPopular)) * 500 +
    Number(Boolean(car.isNewArrival)) * 250 +
    Number(Boolean(car.isBestSeller)) * 150 +
    (car.rating ?? 0) * 10 +
    car.year
  );
}

function getTextMatchBoost(
  car: SearchableCar,
  normalizedQuery: string
): number {
  if (!normalizedQuery) {
    return 0;
  }

  const {
    brand,
    model,
    titleAr,
    titleEn,
    descriptionAr,
    descriptionEn,
  } = car._searchFields;

  let boost = 0;

  if (
    brand === normalizedQuery ||
    model === normalizedQuery ||
    titleAr === normalizedQuery ||
    titleEn === normalizedQuery
  ) {
    boost += 400;
  }

  if (brand.startsWith(normalizedQuery)) {
    boost += 180;
  }

  if (brand.includes(normalizedQuery)) {
    boost += 120;
  }

  if (
    titleAr.includes(normalizedQuery) ||
    titleEn.includes(normalizedQuery)
  ) {
    boost += 90;
  }

  if (model.includes(normalizedQuery)) {
    boost += 70;
  }

  if (
    descriptionAr.includes(normalizedQuery) ||
    descriptionEn.includes(normalizedQuery)
  ) {
    boost += 30;
  }

  return boost;
}

function rankByIntent(
  results: SearchableCar[],
  intent: SearchIntent
): SearchableCar[] {
  if (intent === 'cheap') {
    return [...results].sort(
      (left, right) =>
        getComparablePrice(left) - getComparablePrice(right)
    );
  }

  if (intent === 'luxury') {
    return [...results].sort(
      (left, right) =>
        getComparablePrice(right) - getComparablePrice(left)
    );
  }

  return results;
}

type SearchVehiclesOptions = SearchVehiclesParams & {
  search?: Fuse<SearchableCar>;
};

export function searchVehicles({
  cars,
  query,
  search,
}: SearchVehiclesOptions): SearchableCar[] {
  const normalizedQuery = normalize(query);
  const intent = detectIntent(normalizedQuery);
  const searchQuery = stripTerms(normalizedQuery, [
    ...CHEAP_INTENT_TERMS,
    ...LUXURY_INTENT_TERMS,
    ...GENERIC_VEHICLE_TERMS,
  ]);

  if (!normalizedQuery || !searchQuery) {
    return [...cars].sort(
      (left, right) =>
        getBaseBrowseRank(right) - getBaseBrowseRank(left)
    );
  }

  const activeSearch = search ?? createSearch(cars);

  const ranked = activeSearch.search(searchQuery).map((result) => {
    const fuseScore = result.score ?? 1;
    const score =
      getTextMatchBoost(result.item, searchQuery) -
      fuseScore * 100;

    return {
      car: result.item,
      score,
    };
  });

  const dedupedCars = Array.from(
    new Map(
      ranked
        .sort((left, right) => right.score - left.score)
        .map(({ car }) => [car.id, car] as const)
    ).values()
  );

  return rankByIntent(dedupedCars, intent);
}
