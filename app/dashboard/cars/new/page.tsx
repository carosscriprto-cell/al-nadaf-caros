import { notFound } from 'next/navigation';
import { getMyTenantContext } from '@/lib/dashboard/cars';
import CarFormPage from '@/components/dashboard/cars/CarFormPage';

export default async function NewCarPage() {
  const { tenantId, features } = await getMyTenantContext();
  if (!tenantId) notFound();
  return <CarFormPage features={features} tenantId={tenantId} />;
}
