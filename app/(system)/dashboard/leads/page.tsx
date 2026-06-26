import { getMyTenantLeads, leadStats } from '@/lib/dashboard/leads';
import LeadsTable from '@/components/dashboard/leads/LeadsTable';

export default async function DashboardLeadsPage() {
  const leads = await getMyTenantLeads();
  return <LeadsTable leads={leads} stats={leadStats(leads)} />;
}
