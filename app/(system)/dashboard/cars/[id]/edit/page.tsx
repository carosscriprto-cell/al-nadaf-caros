import { notFound } from 'next/navigation';
import { getMyCarById, getMyTenantContext } from '@/lib/dashboard/cars';
import CarFormPage from '@/components/dashboard/cars/CarFormPage';

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [car, ctx] = await Promise.all([getMyCarById(id), getMyTenantContext()]);
  if (!car || !ctx.tenantId) notFound();
  return <CarFormPage car={car} features={ctx.features} tenantId={ctx.tenantId} />;
}
