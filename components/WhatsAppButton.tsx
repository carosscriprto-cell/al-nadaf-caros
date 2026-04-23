'use client';

import { useLocale, useTranslations } from 'next-intl';
import { featureFlags, siteConfig } from '@/config';
import type { Car } from '../data/cars';
import type { CarContentEntry } from '@/data/cars-content';
import { buildWhatsAppMessage } from '@/lib/buildWhatsAppMessage';
import Link from 'next/link';
import Image from 'next/image';

interface WhatsAppButtonProps {
  car?: Car;
  content?: CarContentEntry;
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export default function WhatsAppButton({ 
  car, 
  content,
  message, 
  className = "", 
  size = 'md',
  children 
}: WhatsAppButtonProps) {
  const t = useTranslations();
  const locale = useLocale();

  if (!featureFlags.enableWhatsApp) {
    return null;
  }

  const getDefaultMessage = () => {
    if (car) {
      return buildWhatsAppMessage({
        car,
        locale,
        content,
      });
    }

    return message || t('car.messages.generic_interest');
  };

  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp.raw.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getDefaultMessage())}`;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base'
  };

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
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
    </Link>
  );
}
