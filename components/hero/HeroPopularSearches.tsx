'use client';

import { TrendingUp } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

// ─── Types ────────────────────────────────────────────────────────────────

interface Props {
  /** Called when the user taps a chip — receives the search term to apply */
  onSelect: (term: string) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────

/**
 * Items pair: [displayLabel, searchTerm]
 * The search term is what actually gets passed to the search index.
 * Display labels can be localized without affecting search behavior.
 */
const EN_ITEMS: [string, string][] = [
  ['Luxury Sedans', 'luxury sedan'],
  ['Family SUVs', 'suv'],
  ['Electric Vehicles', 'electric'],
  ['Performance Cars', 'performance'],
];

const AR_ITEMS: [string, string][] = [
  ['سيدان فاخرة', 'luxury sedan'],
  ['سيارات SUV عائلية', 'suv'],
  ['سيارات كهربائية', 'electric'],
  ['سيارات رياضية', 'performance'],
];

// ─── Component ────────────────────────────────────────────────────────────

export default function HeroPopularSearches({ onSelect }: Props) {
  const locale = useLocale();
  const t = useTranslations();

  const items = locale === 'ar' ? AR_ITEMS : EN_ITEMS;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label={t('hero.popular_searches', { defaultValue: 'Popular searches' })}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/30">
        <TrendingUp size={10} aria-hidden="true" />
        {t('hero.trending', { defaultValue: 'Trending' })}
      </div>

      {items.map(([label, term]) => (
        <button
          key={term}
          type="button"
          onClick={() => onSelect(term)}
          aria-label={`Search for ${label}`}
          className="
            rounded-full
            border border-white/10
            bg-white/5
            px-3.5 py-1.5
            text-xs text-white/65
            backdrop-blur-xl
            transition-all duration-200
            hover:border-white/20 hover:bg-white/10 hover:text-white
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40
            active:scale-[0.97]
          "
        >
          {label}
        </button>
      ))}
    </div>
  );
}