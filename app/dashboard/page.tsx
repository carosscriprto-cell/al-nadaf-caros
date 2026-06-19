import { getMyTenantCars, carStats } from '@/lib/dashboard/cars';
import { getMyTenantLeads, leadStats } from '@/lib/dashboard/leads';
import OverviewClient from '@/components/dashboard/OverviewClient';

export default async function DashboardOverviewPage() {
  const [cars, leads] = await Promise.all([getMyTenantCars(), getMyTenantLeads()]);
  return (
    <OverviewClient
      cars={carStats(cars)}
      leads={leadStats(leads)}
      recentLeads={leads.slice(0, 6).map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        type: l.type,
        status: l.status,
        created_at: l.created_at,
        car: l.car ? { brand: l.car.brand, model: l.car.model, year: l.car.year } : null,
      }))}
    />
  );
}
