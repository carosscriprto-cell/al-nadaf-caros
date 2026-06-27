import { notFound } from 'next/navigation';
import { getMyCarById, getMyTenantContext } from '@/lib/dashboard/cars';
import { getCarBrands } from '@/lib/supabase/brands.server';
import CarFormPage from '@/components/dashboard/cars/CarFormPage';

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [car, ctx, brands] = await Promise.all([getMyCarById(id), getMyTenantContext(), getCarBrands()]);
  if (!car || !ctx.tenantId) notFound();
  return <CarFormPage car={car} features={ctx.features} tenantId={ctx.tenantId} brands={brands} />;
}
