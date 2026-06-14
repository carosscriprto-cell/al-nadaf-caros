import { Fuel, Settings2, Users, Zap } from "lucide-react";
import Image from "next/image";
import type { Car as CarType } from '@/types/vehicles';


export function CarSummaryCard({ car, title }: { car: CarType; title: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl p-3 bg-accent/40 border-2 border-accent">
      <div className="relative rounded-xl overflow-hidden shrink-0 w-[90px] h-[65px]">
        <Image
          src={car.thumbnail || car.images[0]}
          alt={title}
          fill
          sizes="90px"
          quality={70}
          className="object-cover"
        />
      </div>

      <div className="min-w-0">
        <p className="font-semibold text-sm truncate text-foreground">
          {title}
        </p>

        <p className="text-[11px] uppercase tracking-wider mt-0.5 text-muted-foreground">
          {car.class} · {car.year}
        </p>

        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users size={11} /> {car.seats} seats
          </span>

          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Settings2 size={11} /> {car.transmission}
          </span>

          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {car.fuelType === "electric" ? (
              <Zap size={11} />
            ) : (
              <Fuel size={11} />
            )}
            {car.fuelType}
          </span>
        </div>
      </div>

      <div className="ml-auto shrink-0 text-right">
        <p className="text-lg font-bold text-accent">
          ${car.pricing.daily}
        </p>
        <p className="text-[10px] text-muted-foreground">/day</p>
      </div>
    </div>
  );
}