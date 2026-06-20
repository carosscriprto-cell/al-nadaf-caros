// lib/leads/buildLeadMessage.ts — tailored WhatsApp text per lead intent.
// Inline ar/en copy (same pattern as lib/booking/buildWhatsAppMessage). The
// dealer receives a message that already states the intent, the car, and who.

import type { LeadIntent } from './intents';

type Locale = 'ar' | 'en';

export type BuildLeadMessageParams = {
  intent: LeadIntent;
  carTitle: string;
  name: string;
  locale?: string;
  message?: string;
  preferredTime?: string;
};

function safe(locale?: string): Locale {
  return locale === 'ar' ? 'ar' : 'en';
}

// First line: the intent headline, with the car name interpolated.
function headline(intent: LeadIntent, car: string, l: Locale): string {
  if (l === 'ar') {
    switch (intent) {
      case 'availability': return `مرحباً، هل ${car} متوفّرة؟`;
      case 'viewing': return `مرحباً، أريد معاينة ${car}.`;
      case 'purchase': return `مرحباً، أنا مهتم بشراء ${car}.`;
      case 'booking': return `مرحباً، أريد حجز ${car}.`;
    }
  }
  switch (intent) {
    case 'availability': return `Hello, is ${car} available?`;
    case 'viewing': return `Hello, I'd like to view ${car}.`;
    case 'purchase': return `Hello, I'm interested in buying ${car}.`;
    case 'booking': return `Hello, I'd like to book ${car}.`;
  }
}

export function buildLeadMessage({
  intent,
  carTitle,
  name,
  locale,
  message,
  preferredTime,
}: BuildLeadMessageParams): string {
  const l = safe(locale);
  const t = l === 'ar'
    ? { name: 'الاسم', time: 'الوقت المناسب', note: 'ملاحظة' }
    : { name: 'Name', time: 'Preferred time', note: 'Note' };

  const lines = [headline(intent, carTitle, l), ''];
  if (name.trim()) lines.push(`${t.name}: ${name.trim()}`);
  if (intent === 'viewing' && preferredTime?.trim()) lines.push(`${t.time}: ${preferredTime.trim()}`);
  if (message?.trim()) lines.push(`${t.note}: ${message.trim()}`);

  return lines.join('\n');
}
