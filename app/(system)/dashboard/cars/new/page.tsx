import { notFound } from 'next/navigation';
import { getMyTenantContext } from '@/lib/dashboard/cars';
import { getCarBrands } from '@/lib/supabase/brands.server';
import CarFormPage from '@/components/dashboard/cars/CarFormPage';

export default async function NewCarPage() {
  const [{ tenantId, features }, brands] = await Promise.all([getMyTenantContext(), getCarBrands()]);
  if (!tenantId) notFound();
  return <CarFormPage features={features} tenantId={tenantId} brands={brands} />;
}
