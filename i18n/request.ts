import { getRequestConfig } from 'next-intl/server';
import { loadMessages } from './messages';

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locale || 'ar';
  return {
    messages: await loadMessages(safeLocale),
    locale: safeLocale
  };
}); 
