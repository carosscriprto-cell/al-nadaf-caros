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
import { useTenantPages } from '@/components/providers/TenantPagesProvider';
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
  const pages = useTenantPages();
  const cta = CTA[locale === 'ar' ? 'ar' : 'en'];

  // Feature/listing gating, then per-tenant page toggles hide availability/viewing.
  const intents = intentsForCar(car, features).filter((i) =>
    i === 'availability' ? pages.leadAvailability : i === 'viewing' ? pages.leadViewing : true,
  );

  // Sold/reserved cars aren't inquirable — caller already hides the CTA, but
  // guard anyway.
  if (car.status === 'sold' || car.status === 'reserved') return null;

  // Capture-form intents that survived gating (booking is a route, not a form).
  const formIntents = intents.filter((i): i is LeadIntent => i !== 'booking');
  const hasBooking = intents.includes('booking');

  if (variant === 'card') {
    // Prefer purchase, else the first surviving form intent (may be none → only WhatsApp).
    const primary = formIntents.includes('purchase') ? 'purchase' : formIntents[0];
    return (
      <div className="flex gap-2" dir="ltr">
        {primary && (
          <LeadCaptureDialog
            car={car}
            content={content}
            intent={primary}
            source={`${source}:${primary}`}
            locale={locale}
            trigger={<button type="button" className={primaryCls}>{cta[primary]}</button>}
          />
        )}
        {features.enableWhatsApp && (
          <WhatsAppButton
            car={car}
            content={content}
            source={`${source}:whatsapp`}
            className={primary ? '!w-12 shrink-0 justify-center !rounded-2xl !bg-[#25D366] !p-0' : 'flex-1 justify-center !rounded-2xl !bg-[#25D366]'}
          >
            <Image src="/WhatsApp.png" alt="WhatsApp" width={22} height={22} loading="lazy" />
          </WhatsAppButton>
        )}
      </div>
    );
  }

  // Detail: show the full applicable set.
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
