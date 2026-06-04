import type { VehicleFilterState, Car } from '@/types/vehicles';


export function applyVehicleFilters(
  car: Car,
  state: VehicleFilterState,
  priceField: 'daily' | 'total' | 'any'
): boolean {
  if (state.brand.length && !state.brand.includes(car.brand)) return false;
  if (state.category.length && !state.category.includes(car.category)) return false;
  if (state.transmission.length && !state.transmission.includes(car.transmission)) return false;
  if (state.fuelType && car.fuelType !== state.fuelType) return false;
  if (state.class && car.class !== state.class) return false;
  if (state.condition && car.condition !== state.condition) return false;
  if (state.seats && car.seats < Number(state.seats)) return false;
  if (state.delivery && !car.deliveryAvailable) return false;

  const price = resolvePrice(car, priceField);
  if (state.minPrice != null && price != null && price < state.minPrice) return false;
  if (state.maxPrice != null && price != null && price > state.maxPrice) return false;

  return true;
}

function resolvePrice(car: Car, field: 'daily' | 'total' | 'any') {
  if (field === 'daily') return car.pricing.daily ?? null;
  if (field === 'total') return car.pricing.total ?? null;
  return car.pricing.daily ?? car.pricing.total ?? null;
}