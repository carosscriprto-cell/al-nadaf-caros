import Fuse from 'fuse.js';

import type { SearchableCar } from './types';

export function createSearch(cars: SearchableCar[]) {
  return new Fuse<SearchableCar>(cars, {
    includeScore: true,
    shouldSort: true,
    ignoreLocation: true,
    threshold: 0.34,
    minMatchCharLength: 2,
    keys: [
      { name: '_searchFields.brand', weight: 0.35 },
      { name: '_searchFields.titleAr', weight: 0.2 },
      { name: '_searchFields.titleEn', weight: 0.2 },
      { name: '_searchFields.model', weight: 0.15 },
      { name: '_searchText', weight: 0.1 },
    ],
  });
}
