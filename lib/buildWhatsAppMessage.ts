import type { Car } from '@/data/cars';
import {
  getCarTitleFallback,
  type CarContentEntry,
} from '@/data/cars-content';

type WhatsAppLocale = 'ar' | 'en';

type BuildWhatsAppMessageParams = {
  car: Car;
  locale?: string;
  content?: CarContentEntry;
};

const COPY = {
  en: {
    intro: "Hello, I'm interested in this vehicle:",
    labels: {
      vehicle: 'Vehicle',
      listingType: 'Listing Type',
      price: 'Price',
      location: 'Location',
      rent: 'Rent',
      sale: 'Sale',
      onRequest: 'On request',
      perDay: 'per day',
    },
    listingType: {
      rent: 'Rent',
      sale: 'Sale',
      both: 'Rent / Sale',
    },
  },
  ar: {
    intro: 'مرحباً، أنا مهتم بهذه السيارة:',
    labels: {
      vehicle: 'السيارة',
      listingType: 'نوع العرض',
      price: 'السعر',
      location: 'الموقع',
      rent: 'إيجار',
      sale: 'بيع',
      onRequest: 'عند الطلب',
      perDay: 'يومي',
    },
    listingType: {
      rent: 'إيجار',
      sale: 'بيع',
      both: 'إيجار / بيع',
    },
  },
} as const;

function getSafeLocale(locale?: string): WhatsAppLocale {
  return locale === 'ar' ? 'ar' : 'en';
}

function formatPrice(
  value: number | undefined,
  currency: Car['pricing']['currency'],
  locale: WhatsAppLocale
) {
  if (!value) {
    return null;
  }

  return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildWhatsAppMessage({
  car,
  locale,
  content,
}: BuildWhatsAppMessageParams): string {
  const safeLocale = getSafeLocale(locale);
  const copy = COPY[safeLocale];
  const title = content?.title || getCarTitleFallback(car);
  const rentalPrice = formatPrice(
    car.pricing.daily,
    car.pricing.currency,
    safeLocale
  );
  const salePrice = formatPrice(
    car.pricing.total,
    car.pricing.currency,
    safeLocale
  );

  let priceLabel: string = copy.labels.onRequest;

  if (car.listingType === 'both' && rentalPrice && salePrice) {
    priceLabel = `${copy.labels.rent}: ${rentalPrice} / ${copy.labels.perDay} | ${copy.labels.sale}: ${salePrice}`;
  } else if (car.listingType === 'sale') {
    priceLabel = salePrice ?? copy.labels.onRequest;
  } else {
    priceLabel = rentalPrice
      ? `${rentalPrice} / ${copy.labels.perDay}`
      : copy.labels.onRequest;
  }

  const lines = [
    copy.intro,
    '',
    `${copy.labels.vehicle}: ${title}`,
    `${copy.labels.listingType}: ${copy.listingType[car.listingType]}`,
    `${copy.labels.price}: ${priceLabel}`,
  ];

  if (car.city || car.country) {
    lines.push(
      `${copy.labels.location}: ${[car.city, car.country]
        .filter(Boolean)
        .join(', ')}`
    );
  }

  return lines.join('\n');
}
