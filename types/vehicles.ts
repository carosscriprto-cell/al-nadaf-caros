import type { Enums } from '@/lib/supabase/database.types';

// ─── Catalog enums — derived from the DB (single source of truth) ──────────
// Do NOT hand-edit these unions. They are sourced from the generated Supabase
// types so they can never drift from the DB enums. After any enum migration,
// regenerate with `supabase gen types typescript` and these update automatically.

export type ListingType = Enums<'listing_type'>;      // rent | sale | both
export type CarCondition = Enums<'car_condition'>;     // new | used | certified
export type FuelType = Enums<'fuel_type'>;             // petrol | diesel | hybrid | electric | plug-in-hybrid
export type Transmission = Enums<'transmission'>;      // automatic | manual | cvt | dual-clutch | semi-automatic
export type Drivetrain = Enums<'drivetrain'>;          // FWD | RWD | AWD | 4WD
export type Currency = Enums<'currency'>;              // USD | EUR | AED
export type CarClass = Enums<'car_class'>;
export type ContentLocale = Enums<'content_locale'>;   // ar | en

// Lifecycle status (P5a). Stored in cars.status (text + CHECK). Independent of
// `available`: a sold/reserved car may still be shown (with a badge) if the
// dealer opts in. See lib/dashboard/carSchema + the cars.status migration.
export type CarStatus = 'available' | 'sold' | 'reserved';

// 'electric' exists in the DB car_category enum but is intentionally NOT a
// domain category concept (it overlaps fuel_type). Live rows using it are
// remapped in a P3 data-fix; until then the mapper guard logs + passes them.
export type CarCategory = Exclude<Enums<'car_category'>, 'electric'>;

// ─── UI-only types (no DB counterpart) ─────────────────────────────────────
export type PageListingType = 'rent' | 'sale' | 'all'; // used by pages/filters
export type SearchIntent = 'default' | 'cheap' | 'luxury';

// ─── Domain: Car ──────────────────────────────────────────────────────────

export type CarPricing = {
  currency: Currency;
  // Rental
  hourly?: number;
  daily?: number;
  weekly?: number;
  monthly?: number;
  securityDeposit?: number;
  minimumRentalDays?: number;
  // Sale
  total?: number;
  oldPrice?: number;
  negotiable?: boolean;
  financingAvailable?: boolean;
  monthlyInstallment?: number;
  downPayment?: number;
  // P8 — dedicated financing monthly instalment (← cars.installment_monthly).
  // Kept separate from `monthly` (rental monthly price) to avoid value drift.
  installmentMonthly?: number;
};

export type CarOwnershipHistory = {
  owners?: number;
  accidentFree?: boolean;
  serviceHistory?: boolean;
};

export type CarFuelConsumption = {
  city?: number;
  highway?: number;
  combined?: number;
  approxPer20Km?: number;
};

export type Car = {
  id: string | number;
  slug: string;
  brand: string;
  // Canonical brand slug → car_brands (E1). Optional: legacy/unmatched rows have
  // none and fall back to the free-text `brand` for display/grouping.
  brandSlug?: string;
  model: string;
  trim?: string;
  year: number;
  isHero?: boolean;
  listingType: ListingType;
  condition: CarCondition;
  status?: CarStatus;
  category: CarCategory;
  class: CarClass;
  pricing: CarPricing;
  available: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  transmission: Transmission;
  fuelType: FuelType;
  drivetrain?: Drivetrain;
  seats: number;
  doors: number;
  mileage: number;
  color?: string;
  interiorColor?: string;
  engine?: string;
  cylinders?: number;
  horsepower?: number;
  torque?: number;
  topSpeed?: number;
  acceleration?: string;
  fuelConsumption?: CarFuelConsumption;
  fuelTankCapacity?: number;
  electricRange?: number;
  city: string;
  country: string;
  address?: string;
  deliveryAvailable?: boolean;
  pickupLocations?: string[];
  thumbnail: string;
  images: string[];
  ownershipHistory?: CarOwnershipHistory;
  rating?: number;
  reviewsCount?: number;
  // Financing (P7) — mapped from cars.is_financeable. down_payment → pricing.downPayment,
  // price_monthly → pricing.monthly.
  isFinanceable: boolean;
};

// ─── Domain: Car Content (localised) ─────────────────────────────────────

export type CarContentOverview = {
  idealFor?: string[];
  pros?: string[];
  cons?: string[];
};

export type CarContentEntry = {
  title: string;
  shortDescription?: string;
  description?: string;
  overview?: CarContentOverview;
  features?: string[];
  comfortFeatures?: string[];
  safetyFeatures?: string[];
  entertainmentFeatures?: string[];
  requirements?: string[];
  includedServices?: string[];
  warranty?: string;
  // E4 — per-locale (resolved from car_content with AR→EN fallback). country
  // stays single on Car; these five are localized text.
  city?: string;
  address?: string;
  color?: string;
  interiorColor?: string;
  pickupLocations?: string[];
};

export type CarContentMap = Record<string, CarContentEntry>;

// ─── Search ──────────────────────────────────────────────────────────────

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

// ─── Filters ─────────────────────────────────────────────────────────────

export type FilterOption<T extends string = string> = {
  value: T;
  label: string;
};

export type PriceRange = [number, number];

export type VehicleFilterState = {
  search: string;
  brand: string[];
  category: CarCategory[];
  transmission: Transmission[];
  fuelType: FuelType | '';
  class: CarClass | '';
  condition: CarCondition | '';
  seats: number | '';
  minPrice: number | null;
  maxPrice: number | null;
  delivery: boolean;
};

export type VehicleFilterConfig = {
  brandOptions: FilterOption[];
  categoryOptions: FilterOption[];
  classOptions: FilterOption[];
  fuelTypeOptions: FilterOption[];
  conditionOptions: FilterOption[];
  transmissionOptions: FilterOption[];
  seatsOptions: FilterOption[];
  priceMin: number;
  priceMax: number;
};

// ─── Hero Search ──────────────────────────────────────────────────────────

export type HeroFilterState = {
  query: string;
  brand: string;
  model: string;
  fuelType: FuelType | '';
  listingType: PageListingType | ''; // '' means no filter selected
  // 4th-slot filters — only one is ever surfaced per tenant type:
  //   sale-only → condition, rental-only → body type (category). '' = unset.
  condition: CarCondition | '';
  category: CarCategory | '';
};