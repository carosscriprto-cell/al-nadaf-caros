import { getMyTenantCars, carStats } from '@/lib/dashboard/cars';
import { getMyTenantLeads, leadStats } from '@/lib/dashboard/leads';
import OverviewClient from '@/components/dashboard/OverviewClient';

export default async function DashboardOverviewPage() {
  const [cars, leads] = await Promise.all([getMyTenantCars(), getMyTenantLeads()]);
  return <OverviewClient stats={carStats(cars)} newLeads={leadStats(leads).new} />;
}
