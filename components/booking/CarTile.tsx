import type { Car as CarType } from '@/data/cars';
import { Check, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';


/** Compact car tile used in Step 1 grid */
export function CarTile({
  car,
  selected,
  onSelect,
  title,
  tCar,
}: {
  car: CarType;
  selected: boolean;
  onSelect: () => void;
  title: string;
  tCar: (key: string) => string;
  locale: string;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <button
      onClick={onSelect}
      className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all duration-300 focus:outline-none hover:scale-[1.01] active:scale-[0.99]
        ${selected 
          ? 'z-10 border-accent bg-accent/10 shadow-lg scale-[1.02]' 
          : 'z-0 border-border bg-background shadow-sm scale-100'}`}
    >
      {/* Image */}
      <div className="relative w-full pb-[45%]">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}

        <Image
          src={car.thumbnail || car.images[0]}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, 33vw"
          quality={100}
          onLoad={() => setImgLoaded(true)}
          className={`object-cover transition-opacity duration-400 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {car.isFeatured && (
            <span className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest bg-black/50 text-yellow-400 backdrop-blur">
              <Sparkles size={9} /> {tCar('card.featured')}
            </span>
          )}

          {car.condition === 'new' && (
            <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-accent bg-foreground/30 backdrop-blur">
              {tCar('card.new_arrival')}
            </span>
          )}
        </div>

        {/* Year */}
        <div className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-semibold bg-black/50 text-white backdrop-blur">
          {car.year}
        </div>

        {/* Name */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
          <p className="text-white font-semibold text-sm truncate">{title}</p>
          <p className="text-white/60 text-[10px] uppercase tracking-wider">
            {car.class} · {car.category}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[11px] font-medium text-muted-foreground">
            {car.rating ?? '—'}
          </span>
          {car.reviewsCount && (
            <span className="text-[10px] text-muted-foreground">
              ({car.reviewsCount})
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-sm font-bold text-accent">
            {car.pricing.currency === 'USD' ? '$' : ''}{car.pricing.daily}
            {car.pricing.currency !== 'USD' && ` ${car.pricing.currency}`}
          </span>
          <span className="text-[10px] block text-muted-foreground">
            {tCar('detail.values.day')}
          </span>
        </div>
      </div>

      {selected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-accent-foreground/80">
          <div className="rounded-full w-8 h-8 flex items-center justify-center shadow-lg bg-white">
            <Check size={16} className="text-accent" />
          </div>
        </div>
      )}
    </button>
  );
}