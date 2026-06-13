'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

const EN_PLACEHOLDERS = [
  'Search BMW 5 Series...',
  'Search Mercedes S-Class...',
  'Search luxury sedans...',
  'Search family SUVs...',
  'Search electric vehicles...',
  'Search performance cars...',
];

const AR_PLACEHOLDERS = [
  'ابحث عن BMW الفئة الخامسة...',
  'ابحث عن مرسيدس S-Class...',
  'ابحث عن سيارات سيدان فاخرة...',
  'ابحث عن سيارات SUV عائلية...',
  'ابحث عن سيارات كهربائية...',
  'ابحث عن سيارات رياضية...',
];

export function useHeroPlaceholder() {
  const locale = useLocale();

  const placeholders =
    locale === 'ar'
      ? AR_PLACEHOLDERS
      : EN_PLACEHOLDERS;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [placeholders.length]);

  return placeholders[index];
}