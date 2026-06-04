'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';

import type { Car } from '@/types/vehicles';

type Props = {
  car: Car;
};

function getPrice(car: Car) {
  if (
    (car.listingType === 'sale' || car.listingType === 'both') &&
    car.pricing.total
  ) {
    return `$${car.pricing.total.toLocaleString()}`;
  }

  if (
    (car.listingType === 'rent' || car.listingType === 'both') &&
    car.pricing.daily
  ) {
    return `$${car.pricing.daily}/day`;
  }

  return 'Price on request';
}

function getBadge(car: Car) {
  if (car.listingType === 'both') return 'BUY / RENT';
  if (car.listingType === 'sale') return 'SALE';
  return 'RENT';
}

export default function HeroVehicleCard({
  car,
}: Props) {
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/fleet/${car.slug}`}
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-accent/40
        hover:shadow-xl
      "
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={car.thumbnail || car.images?.[0]}
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="(max-width:768px) 50vw, 33vw"
          className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <span
          className="
            absolute
            left-2
            top-2
            rounded-full
            bg-black/60
            px-2
            py-1
            text-[10px]
            font-semibold
            text-white
            backdrop-blur
          "
        >
          {getBadge(car)}
        </span>
      </div>

      <div className="p-3">
        <h3
          className="
            truncate
            text-sm
            font-semibold
            text-foreground
          "
        >
          {car.brand} {car.model}
        </h3>

        <div className="mt-2">
          <p
            className="
              text-base
              font-bold
              text-accent
            "
          >
            {getPrice(car)}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-muted-foreground
            "
          >
            {car.category} • {car.year}
          </p>
        </div>
      </div>
    </Link>
  );
}