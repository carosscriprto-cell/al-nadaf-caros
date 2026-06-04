'use client';


import type { Car } from '@/types/vehicles';
import HeroVehicleCard from './HeroVehicleCard';

type Props = {
  cars: Car[];
};

export default function HeroSearchDropdown({
  cars,
}: Props) {
  if (!cars.length) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        No vehicles found
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {cars.length} Vehicles Found
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cars.map((car) => (
          <HeroVehicleCard
            key={car.id}
            car={car}
          />
        ))}
      </div>
    </div>
  );
}