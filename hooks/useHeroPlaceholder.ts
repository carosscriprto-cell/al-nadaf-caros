// TODO: HeroV2 — minimal implementation to unblock build. Revisit for full HeroV2 behavior.
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

// Rotating search-input placeholders, localized by active locale.
// Kept self-contained (no translation keys) to stay isolated as a baseline fix.
const PLACEHOLDERS: Record<string, string[]> = {
  ar: [
    'ابحث عن سيارة... مثلاً: تويوتا كامري',
    'جرّب: BMW X5',
    'ابحث بالماركة أو الموديل',
    'سيارات للإيجار أو للبيع',
  ],
  en: [
    'Search for a car… e.g. Toyota Camry',
    'Try: BMW X5',
    'Search by brand or model',
    'Cars for rent or sale',
  ],
};

const ROTATION_MS = 3500;

export function useHeroPlaceholder(): string {
  const locale = useLocale();
  const list = PLACEHOLDERS[locale] ?? PLACEHOLDERS.en;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, [list]);

  return list[index] ?? '';
}
