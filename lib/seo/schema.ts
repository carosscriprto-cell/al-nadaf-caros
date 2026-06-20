// lib/seo/schema.ts — JSON-LD builders from the tenant row + car data.
// Pure functions (no IO) so pages can build schema from already-fetched data.

import type { Tables } from '@/lib/supabase/database.types';
import type { Car } from '@/types/vehicles';
import { siteConfig } from '@/config';

type Tenant = Tables<'tenants'>;

function tenantName(tenant: Tenant, locale: string): string {
  return (locale === 'ar' ? tenant.name_ar : tenant.name) || tenant.name;
}

function tenantAddress(tenant: Tenant, locale: string): string | undefined {
  const v = locale === 'ar' ? tenant.address_ar : tenant.address_en;
  return v ?? tenant.address_en ?? tenant.address_ar ?? undefined;
}

function socialLinks(tenant: Tenant): string[] {
  const s = (tenant.social ?? {}) as Record<string, unknown>;
  return Object.values(s).filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
}

// Organization / LocalBusiness for the home page. AutoDealer is the most
// specific schema.org type for a car dealer and inherits LocalBusiness.
export function buildOrganizationSchema(tenant: Tenant, origin: string, locale: string) {
  const name = tenantName(tenant, locale);
  const sameAs = socialLinks(tenant);
  const address = tenantAddress(tenant, locale);
  const logo = tenant.logo_url ?? tenant.og_image_url ?? undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name,
    url: `${origin}/${locale}`,
    ...(logo ? { logo, image: logo } : {}),
    ...(tenant.phone ? { telephone: tenant.phone } : {}),
    ...(tenant.email ? { email: tenant.email } : {}),
    ...(address ? { address: { '@type': 'PostalAddress', streetAddress: address } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  } satisfies Record<string, unknown>;
}

// Vehicle + Offer for a car detail page. Maps the listing type to the offer
// semantics; price comes from sale total or daily rental rate.
export function buildVehicleSchema(
  car: Car,
  content: { title?: string; description?: string; shortDescription?: string } | undefined,
  tenant: Tenant,
  origin: string,
  locale: string,
) {
  const name = content?.title || `${car.brand} ${car.model} ${car.year}`;
  const description = content?.shortDescription || content?.description || undefined;
  const url = `${origin}/${locale}/fleet/${car.slug}`;
  const price = car.pricing.total ?? car.pricing.daily ?? undefined;
  const currency = car.pricing.currency || 'USD';
  const images = car.images?.length ? car.images : car.thumbnail ? [car.thumbnail] : [];

  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name,
    ...(description ? { description } : {}),
    brand: { '@type': 'Brand', name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    ...(car.mileage != null
      ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: car.mileage, unitCode: 'KMT' } }
      : {}),
    ...(car.fuelType ? { fuelType: car.fuelType } : {}),
    ...(car.transmission ? { vehicleTransmission: car.transmission } : {}),
    ...(images.length ? { image: images } : {}),
    url,
    ...(price != null
      ? {
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: currency,
            availability: car.available
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            url,
            seller: { '@type': 'AutoDealer', name: tenantName(tenant, locale) },
          },
        }
      : {}),
  } satisfies Record<string, unknown>;
}

// Fallback OG image when neither tenant nor car provides one.
export const DEFAULT_OG_IMAGE = siteConfig.media.ogImage;
