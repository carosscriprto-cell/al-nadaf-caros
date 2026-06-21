'use client';

// components/leads/LeadCaptureDialog.tsx — short capture form (Radix Dialog).
// Opens from a smart button on a car card/detail. On submit it persists a FULL
// typed lead (write-only, no RETURNING) THEN opens WhatsApp with a message
// tailored to the intent — reusing persistThenWhatsApp so the tab is pre-opened
// inside the click gesture (no popup-block) and WhatsApp fires even if the DB
// write fails. No internal chat; WhatsApp stays the channel.

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { z } from 'zod';

import type { Car } from '@/types/vehicles';
import { getCarTitleFallback, type CarContentEntry } from '@/data/cars-content';
import { persistThenWhatsApp } from '@/lib/leads/persistThenWhatsApp';
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
    subtitle: "Leave your details — we'll continue on WhatsApp.",
    name: 'Name', namePh: 'Your name',
    phone: 'Phone', phonePh: 'e.g. +963 9xx xxx xxx',
    time: 'Preferred time (optional)', timePh: 'e.g. tomorrow afternoon',
    note: 'Message (optional)', notePh: 'Anything else?',
    submit: 'Continue on WhatsApp', cancel: 'Cancel',
    errName: 'Please enter your name',
    errPhone: 'Please enter a valid phone number',
  },
  ar: {
    titles: {
      availability: 'تأكّد من التوفّر',
      viewing: 'احجز معاينة',
      purchase: 'طلب شراء',
      booking: 'احجز هذه السيارة',
      inquiry: 'إرسال استفسار',
    } as Record<CaptureIntent, string>,
    subtitle: 'اترك بياناتك وسنكمل عبر واتساب.',
    name: 'الاسم', namePh: 'اسمك',
    phone: 'الهاتف', phonePh: 'مثال: +963 9xx xxx xxx',
    time: 'الوقت المناسب (اختياري)', timePh: 'مثال: غداً بعد الظهر',
    note: 'رسالة (اختياري)', notePh: 'أي تفاصيل أخرى؟',
    submit: 'المتابعة عبر واتساب', cancel: 'إلغاء',
    errName: 'يرجى إدخال اسمك',
    errPhone: 'يرجى إدخال رقم هاتف صحيح',
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const contact = useTenantContact();

  const schema = z.object({
    name: z.string().trim().min(1, c.errName),
    phone: z.string().trim().regex(phoneRe, c.errPhone),
  });

  const reset = () => {
    setName(''); setPhone(''); setMessage(''); setTime(''); setErrors({}); setSubmitting(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;

    // Store the note + preferred time on the lead row so the dashboard sees them
    // without parsing the WhatsApp text.
    const dbParts: string[] = [];
    if (intent === 'viewing' && time.trim()) dbParts.push(`${c.time}: ${time.trim()}`);
    if (message.trim()) dbParts.push(message.trim());

    // Pre-opens the tab in this gesture, persists, then redirects to WhatsApp.
    void persistThenWhatsApp(
      {
        type: intent,
        source,
        car_id: car?.id != null ? String(car.id) : undefined,
        name: name.trim(),
        phone: phone.trim(),
        message: dbParts.length ? dbParts.join(' — ') : undefined,
        locale: l,
      },
      url,
    );

    setOpen(false);
    reset();
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
              <Dialog.Title className="text-lg font-bold text-foreground">
                {c.titles[intent]}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                {c.subtitle}
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X size={18} />
            </Dialog.Close>
          </div>

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

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:brightness-105 disabled:opacity-60"
            >
              {c.submit}
            </button>
          </form>
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
