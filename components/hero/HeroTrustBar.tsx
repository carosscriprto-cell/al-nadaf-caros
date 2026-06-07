'use client';

import { Shield, Star, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

// ─── Types ────────────────────────────────────────────────────────────────

interface TrustItem {
  icon: React.ElementType;
  labelKey: string;
  defaultLabel: string;
  sublabelKey: string;
  defaultSublabel: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────

const TRUST_ITEMS: TrustItem[] = [
  {
    icon: Star,
    labelKey: 'hero.trust.curated_label',
    defaultLabel: 'Curated Inventory',
    sublabelKey: 'hero.trust.curated_sub',
    defaultSublabel: 'Every vehicle hand-selected',
  },
  {
    icon: Shield,
    labelKey: 'hero.trust.certified_label',
    defaultLabel: 'Certified Vehicles',
    sublabelKey: 'hero.trust.certified_sub',
    defaultSublabel: 'Inspected & verified',
  },
  {
    icon: Truck,
    labelKey: 'hero.trust.delivery_label',
    defaultLabel: 'Delivery Available',
    sublabelKey: 'hero.trust.delivery_sub',
    defaultSublabel: 'To your location',
  },
];

// ─── Component ────────────────────────────────────────────────────────────

export default function HeroTrustBar() {
  const t = useTranslations();

  return (
    <div
      className="
        mx-auto flex max-w-5xl
        items-center
        justify-center
        gap-0
        overflow-hidden
        rounded-2xl
        border border-white/8
        bg-white/[0.04]
        backdrop-blur-sm
        divide-x divide-white/8
      "
      role="list"
      aria-label="Showroom trust indicators"
    >
      {TRUST_ITEMS.map(({ icon: Icon, labelKey, defaultLabel, sublabelKey, defaultSublabel }) => (
        <div
          key={labelKey}
          role="listitem"
          className="
            flex flex-1 items-center justify-center gap-3
            px-4 py-3.5
            sm:px-6 sm:py-4
          "
        >
          <div
            className="
              hidden shrink-0 sm:flex
              h-8 w-8 items-center justify-center
              rounded-full
              border border-white/10
              bg-white/6
            "
            aria-hidden="true"
          >
            <Icon size={14} className="text-accent/80" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-white/85 sm:text-xs">
              {t(labelKey, { defaultValue: defaultLabel })}
            </p>
            <p className="hidden text-[10px] text-white/40 sm:block">
              {t(sublabelKey, { defaultValue: defaultSublabel })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}