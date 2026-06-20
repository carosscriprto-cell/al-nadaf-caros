'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Car } from '@/types/vehicles';
import type { CarContentEntry } from '@/data/cars-content';
import { buildWhatsAppMessage } from '@/lib/buildWhatsAppMessage';
import { persistThenWhatsApp } from '@/lib/leads/persistThenWhatsApp';
import { useTenantFeatures } from '@/components/providers/TenantFeaturesProvider';
import { useTenantContact } from '@/components/providers/TenantContactProvider';
import type { LeadType } from '@/lib/leads/schema';
import Image from 'next/image';

interface WhatsAppButtonProps {
  car?: Car;
  content?: CarContentEntry;
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Where the click came from — stored on the lead (e.g. 'card', 'detail'). */
  source?: string;
  children?: React.ReactNode;
}

// Map the listing type to a lead type so the dashboard reads the right intent:
// rent → booking, sale → purchase, both/unknown/generic → inquiry.
function leadTypeFor(car?: Car): LeadType {
  if (!car) return 'inquiry';
  if (car.listingType === 'rent') return 'booking';
  if (car.listingType === 'sale') return 'purchase';
  return 'inquiry';
}

export default function WhatsAppButton({
  car,
  content,
  message,
  className = '',
  size = 'md',
  source = 'whatsapp',
  children,
}: WhatsAppButtonProps) {
  const t = useTranslations();
  const locale = useLocale();
  const features = useTenantFeatures();
  const contact = useTenantContact();

  if (!features.enableWhatsApp) {
    return null;
  }

  const getDefaultMessage = () => {
    if (car) {
      return buildWhatsAppMessage({ car, locale, content });
    }
    return message || t('car.messages.generic_interest');
  };

  const whatsappUrl = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getDefaultMessage())}`;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  // Persist the lead FIRST (write-only, no RETURNING — anon can't read leads),
  // then open WhatsApp. persistThenWhatsApp pre-opens the tab inside this click
  // gesture so the await doesn't trip popup blockers.
  const handleClick = () => {
    void persistThenWhatsApp(
      {
        type: leadTypeFor(car),
        source,
        car_id: car?.id != null ? String(car.id) : undefined,
        locale: locale === 'ar' ? 'ar' : 'en',
        // No car → carry the generic message so the dealer sees the intent.
        message: car ? undefined : message || undefined,
      },
      whatsappUrl,
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200 ${sizeClasses[size]} ${className}`}
    >
      {children || (
        <>
          <Image
            src="/WhatsApp.png"
            alt="WhatsApp"
            width={16}
            height={16}
            loading="lazy"
          />
          <span>{t('buttons.whatsapp')}</span>
        </>
      )}
    </button>
  );
}
