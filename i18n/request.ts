import { getRequestConfig } from 'next-intl/server';
import { loadMessages } from './messages';

export const locales = ['en', 'ar'] as const;
export type AppLocale = (typeof locales)[number];
// Aligned with middleware: `/` redirects to `/en`, so 'en' is the entry default.
export const defaultLocale: AppLocale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // next-intl v4 passes `requestLocale` (a Promise). It resolves from the
  // [locale] segment because the layout calls setRequestLocale(locale).
  const requested = await requestLocale;
  const locale: AppLocale = locales.includes(requested as AppLocale)
    ? (requested as AppLocale)
    : defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
