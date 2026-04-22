import type { Car } from '@/data/cars';
import type {
  CarContentEntry,
  CarContentMap,
} from '@/data/cars-content/types';

export type SearchableCarFields = {
  brand: string;
  model: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
  carClass: string;
  listingType: string;
};

export type SearchableCar = Car & {
  _searchText: string;
  _searchFields: SearchableCarFields;
};

export type SearchContext = {
  cars: Car[];
  contentAr: CarContentMap;
  contentEn: CarContentMap;
};

export type SearchIntent = 'default' | 'cheap' | 'luxury';

export type SearchVehiclesParams = {
  cars: SearchableCar[];
  query: string;
};

export type SearchBuildEntryParams = {
  car: Car;
  contentAr?: CarContentEntry;
  contentEn?: CarContentEntry;
};
