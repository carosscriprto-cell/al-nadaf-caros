import { getMyTenantCars, getMyTenantFeatures } from '@/lib/dashboard/cars';
import CarsTable from '@/components/dashboard/cars/CarsTable';

export default async function DashboardCarsPage() {
  const [cars, features] = await Promise.all([getMyTenantCars(), getMyTenantFeatures()]);
  // Type filter only makes sense for a tenant that offers BOTH sale and rental.
  const showTypeFilter = features.enableSellCar && features.enableRental;
  return <CarsTable cars={cars} showTypeFilter={showTypeFilter} />;
}
