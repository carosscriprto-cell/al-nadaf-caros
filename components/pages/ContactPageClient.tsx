'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import FAQSection from '@/components/home/FAQSection';
import MapSection from '@/components/map/MapSection';
import PageHero from '@/components/PageHero';
import { siteConfig } from '@/config';
import { persistThenWhatsApp } from '@/lib/leads/persistThenWhatsApp';
import type { StorefrontContact } from '@/lib/tenant/branding';

type ContactPageClientProps = {
  locale: string;
  contact?: StorefrontContact;
};

export default function ContactPageClient({
  locale,
  contact,
}: ContactPageClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('contact');
  const buttons = useTranslations('buttons');

  // Tenant white-label (P6): tenant values win, with static/i18n fallbacks.
  const phoneDisplay = contact?.phone ?? siteConfig.contact.phone.display;
  const whatsappRaw = contact?.whatsapp ?? siteConfig.contact.whatsapp.raw;
  const emailPrimary = contact?.email ?? siteConfig.contact.email.primary;
  const hoursWeekdays = contact?.hours?.weekdays ?? t('info_values.business_hours.weekdays');
  const hoursWeekends = contact?.hours?.weekends ?? t('info_values.business_hours.weekends');

  const contactSchema = z.object({
    name: z.string().min(1, t('validation.name_required')),
    email: z.string().email(t('validation.email_invalid')),
    phone: z.string().optional(),
    subject: z.string().min(1, t('validation.subject_required')),
    message: z.string().min(10, t('validation.message_min')),
  });

  type ContactFormData = z.infer<typeof contactSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values: ContactFormData) => {
    setIsSubmitting(true);

    const lines = [
      t('whatsapp.intro'),
      '',
      `${t('whatsapp.labels.name')}: ${values.name}`,
      `${t('whatsapp.labels.email')}: ${values.email}`,
      values.phone
        ? `${t('whatsapp.labels.phone')}: ${values.phone}`
        : '',
      `${t('whatsapp.labels.subject')}: ${values.subject}`,
      `${t('whatsapp.labels.message')}: ${values.message}`,
    ].filter(Boolean);

    const phone = whatsappRaw.replace(
      /[^0-9]/g,
      ''
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;

    // Record FIRST (DB), then fire the WhatsApp channel.
    await persistThenWhatsApp(
      {
        type: 'inquiry',
        source: 'contact',
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: `${values.subject}\n\n${values.message}`,
        locale: locale === 'ar' ? 'ar' : 'en',
      },
      whatsappUrl,
    );

    reset();
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t('info_labels.phone'),
      details: [
        phoneDisplay,
        siteConfig.contact.phone.supportDisplay || phoneDisplay,
      ],
    },
    {
      icon: MessageCircle,
      title: t('info_labels.whatsapp'),
      details: [
        phoneDisplay,
        t('info_values.whatsapp.helper'),
      ],
    },
    {
      icon: Mail,
      title: t('info_labels.email'),
      details: [
        emailPrimary,
        siteConfig.contact.email.support || emailPrimary,
      ],
    },
    {
      icon: MapPin,
      title: t('info_labels.address'),
      details: [
        t('info_values.address.line1'),
        t('info_values.address.line2'),
      ],
    },
    {
      icon: Clock,
      title: t('info_labels.business_hours'),
      details: [hoursWeekdays, hoursWeekends],
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <PageHero
        // badge={t('page_hero.badge')}
        title={t('page_hero.title')}
        highlight={t('page_hero.highlight')}
        description={t('page_hero.description')}
        primaryButton={{
          label: buttons('call_now'),
          href: `tel:${siteConfig.contact.phone.raw}`,
        }}
        secondaryButton={{
          label: buttons('view_services'),
          href: `/${locale}/services`,
        }}
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-2xl backdrop-blur-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

          <div className="flex h-[420px] flex-col justify-between rounded-3xl bg-accent/10 p-8">
            <div>
              <div className="mb-3 inline-flex rounded-2xl bg-background/70 px-4 py-2 text-sm font-medium text-accent backdrop-blur-xl">
                {t('page_hero.availability')}
              </div>

              <h3 className="max-w-sm text-3xl font-bold leading-tight text-foreground">
                {t('page_hero.card_title')}
              </h3>

              <p className="mt-4 max-w-md leading-7 text-muted-foreground">
                {t('page_hero.card_description')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/80 p-5 backdrop-blur-xl">
                <div className="mb-1 text-sm text-muted-foreground">
                  {t('info_labels.phone')}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {phoneDisplay}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/80 p-5 backdrop-blur-xl">
                <div className="mb-1 text-sm text-muted-foreground">
                  {t('info_labels.email')}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {emailPrimary}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageHero>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mb-4 inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              {t('info_section.badge')}
            </div>

            <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              {t('info_section.title')}
            </h2>

            <p className="text-lg text-muted-foreground">
              {t('info_section.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;

              return (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="relative h-full overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-8 text-center backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-accent/30 hover:shadow-2xl">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl transition-all duration-500 group-hover:scale-150" />

                    <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-7 w-7" />
                    </div>

                    <h3 className="relative z-10 mb-4 text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-accent">
                      {info.title}
                    </h3>

                    <div className="relative z-10 space-y-2 leading-7 text-muted-foreground">
                      {info.details.map((detail) => (
                        <p key={detail}>{detail}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
                  {t('form_section.badge')}
                </div>

                <h2 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">
                  {t('form_section.title')}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        {t('form.name')} *
                      </label>
                      <input
                        type="text"
                        placeholder={t('form.name_placeholder')}
                        {...register('name')}
                        className="w-full rounded-2xl border border-border/60 bg-background/70 px-5 py-4 text-foreground backdrop-blur-xl transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-accent/40 focus:outline-none focus:ring-4 focus:ring-accent/10"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        {t('form.email')} *
                      </label>
                      <input
                        type="email"
                        placeholder={t('form.email_placeholder')}
                        {...register('email')}
                        className="w-full rounded-2xl border border-border/60 bg-background/70 px-5 py-4 text-foreground backdrop-blur-xl transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-accent/40 focus:outline-none focus:ring-4 focus:ring-accent/10"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {t('form.phone')}
                    </label>
                    <input
                      type="tel"
                      placeholder={t('form.phone_placeholder')}
                      {...register('phone')}
                      className="w-full rounded-2xl border border-border/60 bg-background/70 px-5 py-4 text-foreground backdrop-blur-xl transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-accent/40 focus:outline-none focus:ring-4 focus:ring-accent/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {t('form.subject')} *
                    </label>
                    <input
                      type="text"
                      placeholder={t('form.subject_placeholder')}
                      {...register('subject')}
                      className="w-full rounded-2xl border border-border/60 bg-background/70 px-5 py-4 text-foreground backdrop-blur-xl transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-accent/40 focus:outline-none focus:ring-4 focus:ring-accent/10"
                    />
                    {errors.subject && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {t('form.message')} *
                    </label>
                    <textarea
                      rows={6}
                      placeholder={t('form.message_placeholder')}
                      {...register('message')}
                      className="w-full rounded-2xl border border-border/60 bg-background/70 px-5 py-4 text-foreground backdrop-blur-xl transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-accent/40 focus:outline-none focus:ring-4 focus:ring-accent/10"
                    />
                    {errors.message && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent px-8 py-4 font-semibold text-accent-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                    {isSubmitting ? t('form.sending') : t('form.send')}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
                  {t('location_section.badge')}
                </div>

                <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
                  {t('location_section.title')}
                </h2>

                <MapSection mode="contact" className="mt-0 mb-3" />

                <div className="grid gap-4">
                  <div className="rounded-3xl border border-border/60 bg-background/60 p-6 backdrop-blur-xl">
                    <div className="mb-2 text-sm text-muted-foreground">
                      {t('location_section.emergency_title')}
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {phoneDisplay}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t('location_section.emergency_description')}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-border/60 bg-background/60 p-6 backdrop-blur-xl">
                    <div className="mb-2 text-sm text-muted-foreground">
                      {t('location_section.support_title')}
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {siteConfig.contact.email.support || emailPrimary}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t('location_section.support_description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <FAQSection group="contact" />
    </div>
  );
}
