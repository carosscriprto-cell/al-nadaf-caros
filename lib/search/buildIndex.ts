import type { Car } from '@/data/cars';
import type {
  CarContentEntry,
  CarContentMap,
} from '@/data/cars-content/types';

import { normalize } from './normalize';
import type {
  SearchBuildEntryParams,
  SearchableCar,
  SearchableCarFields,
} from './types';

function joinText(values: Array<string | number | undefined>) {
  return values.filter(Boolean).join(' ');
}

function flattenContentValues(content?: CarContentEntry): string {
  if (!content) {
    return '';
  }

  return joinText([
    content.title,
    content.shortDescription,
    content.description,
    content.warranty,
    ...(content.features ?? []),
    ...(content.comfortFeatures ?? []),
    ...(content.safetyFeatures ?? []),
    ...(content.entertainmentFeatures ?? []),
    ...(content.requirements ?? []),
    ...(content.includedServices ?? []),
    ...(content.overview?.idealFor ?? []),
    ...(content.overview?.pros ?? []),
    ...(content.overview?.cons ?? []),
  ]);
}

function buildSearchFields({
  car,
  contentAr,
  contentEn,
}: SearchBuildEntryParams): SearchableCarFields {
  return {
    brand: normalize(car.brand),
    model: normalize(joinText([car.model, car.trim, car.year])),
    titleAr: normalize(contentAr?.title ?? ''),
    titleEn: normalize(contentEn?.title ?? ''),
    descriptionAr: normalize(flattenContentValues(contentAr)),
    descriptionEn: normalize(flattenContentValues(contentEn)),
    category: normalize(car.category),
    carClass: normalize(car.class),
    listingType: normalize(car.listingType),
  };
}

export function buildSearchableText({
  car,
  contentAr,
  contentEn,
}: SearchBuildEntryParams): string {
  const baseCarText = joinText([
    car.brand,
    car.model,
    car.trim,
    car.year,
    car.category,
    car.class,
    car.listingType,
    car.condition,
    car.transmission,
    car.fuelType,
    car.drivetrain,
    car.city,
    car.country,
    car.color,
    car.interiorColor,
    car.engine,
    car.seats,
    car.doors,
    car.horsepower,
    car.topSpeed,
    ...(car.pickupLocations ?? []),
  ]);

  return normalize(
    joinText([
      baseCarText,
      flattenContentValues(contentAr),
      flattenContentValues(contentEn),
    ])
  );
}

export function buildSearchableCar({
  car,
  contentAr,
  contentEn,
}: SearchBuildEntryParams): SearchableCar {
  return {
    ...car,
    _searchFields: buildSearchFields({
      car,
      contentAr,
      contentEn,
    }),
    _searchText: buildSearchableText({
      car,
      contentAr,
      contentEn,
    }),
  };
}

export function prepareCarsForSearch(
  cars: Car[],
  contentArMap: CarContentMap,
  contentEnMap: CarContentMap
): SearchableCar[] {
  return cars.map((car) =>
    buildSearchableCar({
      car,
      contentAr: contentArMap[car.slug],
      contentEn: contentEnMap[car.slug],
    })
  );
}
