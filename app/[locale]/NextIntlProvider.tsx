
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { loadMessages } from '@/i18n/messages';

export default async function NextIntlProvider({ children, locale }: { children: React.ReactNode; locale: string }) {
  let messages;
  try {
    messages = await loadMessages(locale);
  } catch {
    notFound();
  }
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
} 
