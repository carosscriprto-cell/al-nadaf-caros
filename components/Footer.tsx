'use client'

import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Car,
  Clock3,
  Facebook,
  Instagram,
  Linkedin,
  LucideIcon,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';

import { siteConfig } from '@/config';
import type { StorefrontSocial, StorefrontHours } from '@/lib/tenant/branding';
import { useTenantFeatures } from '@/components/providers/TenantFeaturesProvider';
import { useLocale, useTranslations } from 'next-intl';

// Tenant contact, resolved server-side (P6 white-label). Each field falls back
// to the static siteConfig/i18n default when the tenant hasn't set it.
export type FooterContact = {
  phone?: string;
  email?: string;
  addressEn?: string;
  addressAr?: string;
  hours?: StorefrontHours;
};

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
} as const;

export default function Footer({
  social,
  contact,
}: {
  social?: StorefrontSocial;
  contact?: FooterContact;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const features = useTenantFeatures();
  const localizedAddress =
    siteConfig.contact.address.localized[
      locale as keyof typeof siteConfig.contact.address.localized
    ] ?? siteConfig.contact.address.localized.en;

  // Tenant values win; fall back to the static defaults / i18n.
  const phoneDisplay = contact?.phone ?? siteConfig.contact.phone.display;
  const phoneRaw = contact?.phone ?? siteConfig.contact.phone.raw;
  const emailPrimary = contact?.email ?? siteConfig.contact.email.primary;
  const tenantAddress = locale === 'ar' ? contact?.addressAr : contact?.addressEn;
  const addressLines = tenantAddress ? [tenantAddress] : [localizedAddress.line1, localizedAddress.line2];
  const hoursWeekdays = contact?.hours?.weekdays ?? t('footer.contact.hours.weekdays');
  const hoursWeekends = contact?.hours?.weekends ?? t('footer.contact.hours.weekends');

  const brandName =
    locale === 'ar'
      ? siteConfig.brand.localizedName.ar
      : siteConfig.brand.localizedName.en;

  const companyLinks = [
    { href: `/${locale}/about`, label: t('footer.links.about') },
    { href: `/${locale}/fleet`, label: t('footer.links.fleet') },
    { href: `/${locale}/contact`, label: t('footer.links.contact') },
  ];

  const serviceLinks = [
    { href: `/${locale}/fleet`, label: t('footer.links.fleet') },
    // Services + booking are rental-tenant concepts — hidden for sale-only tenants.
    ...(features.enableRental
      ? [
          { href: `/${locale}/services`, label: t('footer.services.chauffeur') },
          { href: `/${locale}/booking`, label: t('footer.services.booking') },
        ]
      : []),
  ];

  const legalLinks = [
    {
      href: `/${locale}${siteConfig.urls.privacy}`,
      label: t('legal.privacy'),
    },
    {
      href: `/${locale}${siteConfig.urls.terms}`,
      label: t('legal.terms'),
    },
  ];

  // Tenant socials (P5c white-label) override the static defaults, resolved
  // server-side in the layout and passed down.
  const socialLinks = Object.entries(social ?? siteConfig.social).filter(
    ([, href]) => Boolean(href)
  ) as Array<[keyof typeof socialIcons, string]>;

  const contactItems = [
    features.enablePhoneContact
      ? {
          key: 'phone',
          icon: Phone,
          href: `tel:${phoneRaw}`,
          title: t('footer.contact.phone'),
          lines: [phoneDisplay],
        }
      : null,
    features.enableEmailContact
      ? {
          key: 'email',
          icon: Mail,
          href: `mailto:${emailPrimary}`,
          title: t('footer.contact.email'),
          lines: [emailPrimary],
        }
      : null,
    {
      key: 'address',
      icon: MapPin,
      title: t('footer.contact.address'),
      lines: addressLines,
    },
    {
      key: 'hours',
      icon: Clock3,
      title: t('footer.contact.hours.title'),
      lines: [hoursWeekdays, hoursWeekends],
    },
  ].filter(Boolean) as Array<{
    key: string;
    icon: LucideIcon;
    href?: string;
    title: string;
    lines: string[];
  }>;

  return (
    <footer className="relative border-t border-border/60 bg-card/40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="rounded-[2rem] border border-border/60 bg-background/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-card text-accent shadow-sm">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  {brandName}
                </p>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {t('footer.badge')}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
              {t('footer.company')}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map(([platform, href]) => {
                const Icon = socialIcons[platform];

                return (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t(`footer.social.${platform}`)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/80 text-muted-foreground transition-all duration-200 hover:border-accent/40 hover:bg-accent hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="md:hidden md:col-span-3">
            <Accordion className="space-y-3">
              <AccordionItem>
                <AccordionTrigger>
                  {t('footer.sections.company')}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {companyLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="transition-colors duration-200 hover:text-accent"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem>
                <AccordionTrigger>
                  {t('footer.sections.services')}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {serviceLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="transition-colors duration-200 hover:text-accent"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem>
                <AccordionTrigger>
                  {t('footer.sections.contact')}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    {contactItems.map((item) => {
                      const Icon = item.icon;
                      const content = (
                        <>
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {item.title}
                            </p>
                            {item.lines.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        </>
                      );

                      if (item.href) {
                        return (
                          <a
                            key={item.key}
                            href={item.href}
                            className="flex items-start gap-3 transition-colors duration-200 hover:text-accent"
                          >
                            {content}
                          </a>
                        );
                      }

                      return (
                        <div
                          key={item.key}
                          className="flex items-start gap-3"
                        >
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="hidden space-y-4 md:block">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/90">
              {t('footer.sections.company')}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors duration-200 hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden space-y-4 md:block">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/90">
              {t('footer.sections.services')}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {serviceLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors duration-200 hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden space-y-4 md:block">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/90">
              {t('footer.sections.contact')}
            </h3>

            <div className="space-y-4 text-sm text-muted-foreground">
              {contactItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {item.title}
                      </p>
                      {item.lines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </>
                );

                if (item.href) {
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      className="flex items-start gap-3 transition-colors duration-200 hover:text-accent"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div
                    key={item.key}
                    className="flex items-start gap-3"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            {t('footer.copyright', {
              year: siteConfig.legal.copyrightStartYear,
              brand: brandName,
            })}
          </p>

          <div className="flex flex-wrap items-center gap-4 md:justify-end">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors duration-200 hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
