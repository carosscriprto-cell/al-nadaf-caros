'use client';

import { Shield, Star, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Slim, quiet trust strip — the premium counterpart to the boxed HeroTrustBar.
// Per frontend-design ("remove one accessory"), it drops the card chrome and the
// sub-labels: a single icon + label per signal, set as a calm reassurance line
// under the search panel so it never competes with it.

const TRUST_ITEMS = [
  { icon: Star, labelKey: 'hero.trust.curated_label', defaultLabel: 'Curated inventory' },
  { icon: Shield, labelKey: 'hero.trust.certified_label', defaultLabel: 'Certified vehicles' },
  { icon: Truck, labelKey: 'hero.trust.delivery_label', defaultLabel: 'Delivery available' },
] as const;

export default function HeroTrustStrip() {
  const t = useTranslations();

  return (
    <ul
      className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5"
      aria-label="Why shop with us"
    >
      {TRUST_ITEMS.map(({ icon: Icon, labelKey, defaultLabel }) => (
        <li
          key={labelKey}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
        >
          <Icon size={15} className="text-accent" aria-hidden="true" />
          {t(labelKey, { defaultValue: defaultLabel })}
        </li>
      ))}
    </ul>
  );
}
