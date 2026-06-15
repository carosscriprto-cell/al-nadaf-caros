import { getMyTenantCars, carStats } from '@/lib/dashboard/cars';
import OverviewClient from '@/components/dashboard/OverviewClient';

export default async function DashboardOverviewPage() {
  const cars = await getMyTenantCars();
  return <OverviewClient stats={carStats(cars)} />;
}
