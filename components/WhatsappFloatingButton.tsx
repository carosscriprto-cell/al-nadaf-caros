'use client';

import Image from 'next/image';
import { siteConfig } from '@/config/site';

export default function WhatsAppFloatingButton({
  locale = 'en',
}: {
  locale?: string;
}) {
  const phone = siteConfig.contact.whatsapp.raw.replace(/[^0-9]/g, '');

  const message =
    locale === 'ar'
    ? 'مرحباً، اطلعت على موقعكم وأرغب بالحصول على مزيد من التفاصيل.'
    : 'Hello, I visited your website and would like more details.';

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;
  

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed bottom-4 right-6 z-40
        flex h-12 w-12 items-center justify-center
        rounded-2xl
        bg-[#25D366]
        shadow-lg shadow-[#25D366]/30
        transition-all duration-300
        hover:scale-110 hover:shadow-xl
      "
    >
      <Image
        src="/WhatsApp.png"
        alt="WhatsApp"
        width={28}
        height={28}
        loading="lazy"
      />
    </a>
  );
}
