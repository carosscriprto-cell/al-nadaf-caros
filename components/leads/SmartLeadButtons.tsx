'use client';

// components/leads/SmartLeadButtons.tsx — the intent-driven CTA cluster shown on
// car cards and the detail page. Which buttons appear is gated by the tenant's
// features AND the car's listing_type (intentsForCar): sale cars never show
// "book period", rental cars never show "buy/viewing". Capture intents open the
// LeadCaptureDialog; 'booking' links to the existing rental wizard. A direct
// WhatsApp button can sit beside them.

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';

import type { Car } from '@/types/vehicles';
import type { CarContentEntry } from '@/data/cars-content';
import { useTenantFeatures } from '@/components/providers/TenantFeaturesProvider';
import { intentsForCar, type LeadIntent } from '@/lib/leads/intents';
import WhatsAppButton from '@/components/WhatsAppButton';
import LeadCaptureDialog from './LeadCaptureDialog';

const CTA = {
  en: {
    availability: 'Check availability', viewing: 'Book a viewing',
    purchase: 'Buy now', booking: 'Book a period',
  } as Record<LeadIntent, string>,
  ar: {
    availability: 'تأكّد من التوفّر', viewing: 'احجز معاينة',
    purchase: 'طلب شراء', booking: 'احجز فترة',
  } as Record<LeadIntent, string>,
};

const primaryCls =
  'flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:brightness-105';
const outlineCls =
  'flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 text-sm font-semibold text-foreground transition hover:border-accent/40 hover:text-accent';

// On a compact card we want the primary CTA to OPEN a capture form (not the
// multi-step wizard), so prefer purchase → availability.
function cardPrimaryIntent(intents: LeadIntent[]): LeadIntent {
  return intents.includes('purchase') ? 'purchase' : 'availability';
}

export default function SmartLeadButtons({
  car,
  content,
  source,
  variant,
}: {
  car: Car;
  content?: CarContentEntry;
  source: string;
  variant: 'card' | 'detail';
}) {
  const locale = useLocale();
  const features = useTenantFeatures();
  const cta = CTA[locale === 'ar' ? 'ar' : 'en'];
  const intents = intentsForCar(car, features);

  // Sold/reserved cars aren't inquirable — caller already hides the CTA, but
  // guard anyway.
  if (car.status === 'sold' || car.status === 'reserved') return null;

  if (variant === 'card') {
    const primary = cardPrimaryIntent(intents);
    return (
      <div className="flex gap-2" dir="ltr">
        <LeadCaptureDialog
          car={car}
          content={content}
          intent={primary}
          source={`${source}:${primary}`}
          locale={locale}
          trigger={<button type="button" className={primaryCls}>{cta[primary]}</button>}
        />
        {features.enableWhatsApp && (
          <WhatsAppButton
            car={car}
            content={content}
            source={`${source}:whatsapp`}
            className="!w-12 shrink-0 justify-center !rounded-2xl !bg-[#25D366] !p-0"
          >
            <Image src="/WhatsApp.png" alt="WhatsApp" width={22} height={22} loading="lazy" />
          </WhatsAppButton>
        )}
      </div>
    );
  }

  // Detail: show the full applicable set.
  const formIntents = intents.filter((i) => i !== 'booking');
  const hasBooking = intents.includes('booking');
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-2.5">
        {formIntents.map((intent, idx) => (
          <LeadCaptureDialog
            key={intent}
            car={car}
            content={content}
            intent={intent}
            source={`${source}:${intent}`}
            locale={locale}
            trigger={
              <button type="button" className={idx === 0 ? primaryCls : outlineCls}>
                {cta[intent]}
              </button>
            }
          />
        ))}
        {hasBooking && (
          <Link href={`/${locale}/booking`} className={outlineCls}>
            {cta.booking}
          </Link>
        )}
      </div>
      {features.enableWhatsApp && (
        <WhatsAppButton
          car={car}
          content={content}
          source={`${source}:whatsapp`}
          className="w-full justify-center !rounded-2xl !bg-[#25D366] py-3 !text-sm font-semibold"
        >
          <Image src="/WhatsApp.png" alt="WhatsApp" width={22} height={22} loading="lazy" />
          WhatsApp
        </WhatsAppButton>
      )}
    </div>
  );
}
