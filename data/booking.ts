import { SiteConfig } from "@/config/site";
import { CarContentEntry } from "./cars-content";
import type { Car as CarType } from '@/types/vehicles';


export type Step = 0 | 1 | 2 | 3;

export interface BookingState {
  step: Step;
  selectedCar: CarType | null;
  location: string;
  locationLabel: string;
  dateFrom: string;
  dateTo: string;
  pickupTime: string;
}

export type BookingAction =
  | { type: 'SET_STEP'; payload: Step }
  | { type: 'SELECT_CAR'; payload: CarType }
  | { type: 'SET_LOCATION'; payload: { value: string; label: string } }
  | { type: 'SET_DATES'; payload: { dateFrom: string; dateTo: string } }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'RESET' };

export interface BookingExperienceProps {
  cars: CarType[];
  contentMap?: Record<string, CarContentEntry>;
  // Per-locale content maps for the search index (Arabic + English). Provided by
  // the server component via getAllCarsForSearch; replaces the old client-side
  // useCarContentMap() static loaders removed in Phase 3.
  contentAr?: Record<string, CarContentEntry>;
  contentEn?: Record<string, CarContentEntry>;
  whatsappNumber?: SiteConfig['contact']['whatsapp'];
}