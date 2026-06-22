'use client';

// components/leads/LeadCaptureDialog.tsx — short capture form (Radix Dialog).
// Opens from a smart button on a car card/detail. Flow (QA 2b · 4.9):
//   [Send] → persist the lead FIRST (write-only) → confirmation "Sent ✓" with
//   [Yes, open WhatsApp] / [No, thanks]. The lead is ALWAYS saved; WhatsApp is a
//   conscious choice AFTER, opened from a fresh click (no popup-block), using the
//   TENANT's number. Choosing WhatsApp flips a whatsapp_opened flag on the lead.

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Check } from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';

import type { Car } from '@/types/vehicles';
import { getCarTitleFallback, type CarContentEntry } from '@/data/cars-content';
import { submitLead } from '@/lib/leads/submit';
import { markLeadWhatsapp } from '@/lib/leads/markWhatsapp';
import { buildLeadMessage, type LeadMessageIntent } from '@/lib/leads/buildLeadMessage';
import { useTenantContact } from '@/components/providers/TenantContactProvider';

type Locale = 'ar' | 'en';

// car-based intents + a car-less general 'inquiry' (e.g. financing).
type CaptureIntent = LeadMessageIntent;

const COPY = {
  en: {
    titles: {
      availability: 'Check availability',
      viewing: 'Book a viewing',
      purchase: 'Purchase request',
      booking: 'Book this car',
      inquiry: 'Send an inquiry',
    } as Record<CaptureIntent, string>,
    subtitle: 'Leave your details and the dealer will get back to you.',
    name: 'Name', namePh: 'Your name',
    phone: 'Phone', phonePh: 'e.g. +963 9xx xxx xxx',
    time: 'Preferred time (optional)', timePh: 'e.g. tomorrow afternoon',
    note: 'Message (optional)', notePh: 'Anything else?',
    send: 'Send', sending: 'Sending…',
    sentTitle: 'Sent ✓',
    sentSubtitle: 'Want to also send this on WhatsApp for faster follow-up?',
    yesWa: 'Yes, open WhatsApp', noThanks: 'No, thanks',
    errName: 'Please enter your name',
    errPhone: 'Please enter a valid phone number',
    sendFailed: 'Could not send. Please try again.',
  },
  ar: {
    titles: {
      availability: 'تأكّد من التوفّر',
      viewing: 'احجز معاينة',
      purchase: 'طلب شراء',
      booking: 'احجز هذه السيارة',
      inquiry: 'إرسال استفسار',
    } as Record<CaptureIntent, string>,
    subtitle: 'اترك بياناتك وسيتواصل معك المعرض.',
    name: 'الاسم', namePh: 'اسمك',
    phone: 'الهاتف', phonePh: 'مثال: +963 9xx xxx xxx',
    time: 'الوقت المناسب (اختياري)', timePh: 'مثال: غداً بعد الظهر',
    note: 'رسالة (اختياري)', notePh: 'أي تفاصيل أخرى؟',
    send: 'إرسال', sending: 'جارٍ الإرسال…',
    sentTitle: 'تم الإرسال ✓',
    sentSubtitle: 'هل تريد أيضاً إرسالها عبر واتساب لمتابعة أسرع؟',
    yesWa: 'افتح واتساب', noThanks: 'لا، شكراً',
    errName: 'يرجى إدخال اسمك',
    errPhone: 'يرجى إدخال رقم هاتف صحيح',
    sendFailed: 'تعذّر الإرسال. حاول مرة أخرى.',
  },
} as const;

const phoneRe = /^[+(]?[\d][\d\s()-]{5,}$/;

export default function LeadCaptureDialog({
  car,
  content,
  intent,
  subject,
  source,
  locale,
  trigger,
}: {
  car?: Car;
  content?: CarContentEntry;
  intent: CaptureIntent;
  // Topic label used when there is no car (e.g. 'financing'). Drives the
  // WhatsApp headline + dialog context for general inquiries.
  subject?: string;
  source: string;
  locale: string;
  trigger: React.ReactNode;
}) {
  const l: Locale = locale === 'ar' ? 'ar' : 'en';
  const c = COPY[l];
  const dir = l === 'ar' ? 'rtl' : 'ltr';

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'form' | 'sent'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [waUrl, setWaUrl] = useState('');
  const contact = useTenantContact();

  const schema = z.object({
    name: z.string().trim().min(1, c.errName),
    phone: z.string().trim().regex(phoneRe, c.errPhone),
  });

  const reset = () => {
    setPhase('form');
    setName(''); setPhone(''); setMessage(''); setTime('');
    setErrors({}); setSubmitting(false); setSendError(false); setWaUrl('');
  };

  const closeAll = () => { setOpen(false); reset(); };

  // [Send] — persist the lead FIRST, then show the confirmation.
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(false);
    const parsed = schema.safeParse({ name, phone });
    if (!parsed.success) {
      const fe: { name?: string; phone?: string } = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0];
        if (k === 'name' || k === 'phone') fe[k] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setSubmitting(true);

    const carTitle = content?.title || (car ? getCarTitleFallback(car) : subject) || '';
    const text = buildLeadMessage({ intent, carTitle, name, locale: l, message, preferredTime: time });
    const cleanNumber = contact.whatsapp.replace(/[^0-9]/g, '');

    // Store the note + preferred time on the lead row so the dashboard sees them.
    const dbParts: string[] = [];
    if (intent === 'viewing' && time.trim()) dbParts.push(`${c.time}: ${time.trim()}`);
    if (message.trim()) dbParts.push(message.trim());

    const res = await submitLead({
      type: intent,
      source,
      car_id: car?.id != null ? String(car.id) : undefined,
      name: name.trim(),
      phone: phone.trim(),
      message: dbParts.length ? dbParts.join(' — ') : undefined,
      locale: l,
    });

    setSubmitting(false);
    if (!res.ok) { setSendError(true); return; }

    setWaUrl(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`);
    setPhase('sent');
  };

  // [Yes, open WhatsApp] — open from this fresh click (no popup-block), then
  // flag the lead as whatsapp_opened (best-effort; the lead is already saved).
  const onOpenWhatsapp = () => {
    if (waUrl) window.open(waUrl, '_blank', 'noopener,noreferrer');
    void markLeadWhatsapp(phone.trim());
    closeAll();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          dir={dir}
          className="fixed left-1/2 top-1/2 z-[61] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-2xl focus:outline-none"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-lg font-bold text-foreground">
                {phase === 'sent' && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={14} />
                  </span>
                )}
                {phase === 'sent' ? c.sentTitle : c.titles[intent]}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                {phase === 'sent' ? c.sentSubtitle : c.subtitle}
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X size={18} />
            </Dialog.Close>
          </div>

          {phase === 'form' ? (
            <form onSubmit={onSubmit} className="space-y-3">
              <Field label={c.name} error={errors.name}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={c.namePh}
                  className={inputCls}
                  autoFocus
                />
              </Field>

              <Field label={c.phone} error={errors.phone}>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={c.phonePh}
                  inputMode="tel"
                  dir="ltr"
                  className={inputCls}
                />
              </Field>

              {intent === 'viewing' && (
                <Field label={c.time}>
                  <input
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder={c.timePh}
                    className={inputCls}
                  />
                </Field>
              )}

              <Field label={c.note}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={c.notePh}
                  rows={3}
                  className={inputCls}
                />
              </Field>

              {sendError && <p className="text-xs text-red-500">{c.sendFailed}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:brightness-105 disabled:opacity-60"
              >
                {submitting ? c.sending : c.send}
              </button>
            </form>
          ) : (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onOpenWhatsapp}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:brightness-105"
              >
                <Image src="/WhatsApp.png" alt="" width={18} height={18} loading="lazy" />
                {c.yesWa}
              </button>
              <button
                type="button"
                onClick={closeAll}
                className="w-full rounded-xl border border-border bg-background py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
              >
                {c.noThanks}
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const inputCls =
  'w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent placeholder:text-muted-foreground/60';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
