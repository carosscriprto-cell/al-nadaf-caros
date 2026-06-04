'use client';

const ITEMS = [
  'SUV',
  'BMW',
  'Mercedes',
  'Toyota',
  'Electric',
  'Luxury',
];

export default function HeroPopularSearches() {
  return (
    <div className="flex flex-wrap gap-2">
      {ITEMS.map((item) => (
        <button
          key={item}
          className="
          rounded-full
          border
          border-white/10
          bg-white/10
          px-4
          py-2
          text-sm
          text-white
          backdrop-blur-xl
        "
        >
          {item}
        </button>
      ))}
    </div>
  );
}