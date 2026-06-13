import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cars } from '@/data/cars';
import { siteConfig } from '@/config';
import { BookingClientPage } from './BookingClientPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('booking');
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}



export default function BookingPage() {

  return (
      <BookingClientPage 
          cars={cars}
          whatsappNumber={siteConfig.contact.whatsapp}
        />
  );
}