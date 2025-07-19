

import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

export default async function NextIntlProvider({ children, locale }: { children: React.ReactNode; locale: string }) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}/common.json`)).default;
  } catch {
    notFound();
  }
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
} 