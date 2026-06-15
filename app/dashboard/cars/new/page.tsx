import { getMyTenantFeatures } from '@/lib/dashboard/cars';
import CarFormPage from '@/components/dashboard/cars/CarFormPage';

export default async function NewCarPage() {
  const features = await getMyTenantFeatures();
  return <CarFormPage features={features} />;
}
