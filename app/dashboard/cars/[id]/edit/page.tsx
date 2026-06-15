import { notFound } from 'next/navigation';
import { getMyCarById, getMyTenantFeatures } from '@/lib/dashboard/cars';
import CarFormPage from '@/components/dashboard/cars/CarFormPage';

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [car, features] = await Promise.all([getMyCarById(id), getMyTenantFeatures()]);
  if (!car) notFound();
  return <CarFormPage car={car} features={features} />;
}
