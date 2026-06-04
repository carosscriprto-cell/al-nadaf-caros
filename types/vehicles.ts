export type ListingType = 'rent' | 'sale' | 'both';
export type PageListingType = 'rent' | 'sale' | 'all'; // used by pages/filters
export type CarCondition = 'new' | 'used' | 'certified';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type Transmission = 'automatic' | 'manual';
export type Drivetrain = 'FWD' | 'RWD' | 'AWD' | '4WD';
export type Currency = 'USD' | 'EUR' | 'AED';
export type CarCategory = 'sedan' | 'suv' | 'coupe' | 'hatchback' | 'convertible' | 'pickup' | 'electric' | 'sports';
export type CarClass = 'economy' | 'standard' | 'premium' | 'luxury' | 'executive' | 'performance' | 'ultra-luxury';
export type SearchIntent = 'default' | 'cheap' | 'luxury';
export type ContentLocale = 'ar' | 'en';

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
  model: string;
  trim?: string;
  year: number;
  isHero?: boolean;
  listingType: ListingType;
  condition: CarCondition;
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
  category: string[];
  transmission: string[];
  fuelType: string;
  class: string;
  condition: string;
  seats: string;
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
  fuelType: string;
  listingType: string;
};