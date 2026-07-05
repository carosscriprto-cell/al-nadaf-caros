'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Car, Menu, Phone, X } from 'lucide-react';

import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { useTenantFeatures } from '@/components/providers/TenantFeaturesProvider';
import { useTenantPages } from '@/components/providers/TenantPagesProvider';
import { useTenantContact } from '@/components/providers/TenantContactProvider';
import { cn } from '@/components/ui/utils';

type NavItem = {
  href: string;
  label: string;
};

function isActiveRoute(
  pathname: string,
  locale: string,
  href: string
) {
  const localizedHref = `/${locale}${href}`;

  if (href === '') {
    return pathname === `/${locale}` || pathname === `/${locale}/`;
  }

  return (
    pathname === localizedHref ||
    pathname.startsWith(`${localizedHref}/`)
  );
}

type NavbarProps = {
  // Tenant branding (P4) — resolved server-side and passed down. Falls back to
  // the static siteConfig when absent so the component still renders standalone.
  brandName?: string;
  logoUrl?: string | null;
};

export default function Navbar({ brandName, logoUrl }: NavbarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations();
  const features = useTenantFeatures();
  const pages = useTenantPages();
  const contact = useTenantContact();
  const [isOpen, setIsOpen] = useState(false);

  // Services is shown only for rental/hybrid tenants (gated route, P2.5-3a).
  const navItems = useMemo<NavItem[]>(
    () => [
      { href: '', label: t('nav.home') },
      { href: '/fleet', label: t('nav.fleet') },
      ...(features.enableRental ? [{ href: '/services', label: t('nav.services') }] : []),
      // Financing is a Pro+ feature for sale tenants (gated route, P2.5-3b).
      ...(features.enableFinancing ? [{ href: '/financing', label: t('nav.financing') }] : []),
      // About is optional per tenant (Site tab, P2.5-4b).
      ...(pages.about ? [{ href: '/about', label: t('nav.about') }] : []),
      { href: '/contact', label: t('nav.contact') },
    ],
    [t, features.enableRental, features.enableFinancing, pages.about]
  );

  // Tenant name only (resolved server-side per locale in the site layout:
  // name_ar for ar, name otherwise). No static "Caros"/siteConfig fallback on
  // the storefront — this is a white-label surface.
  const displayBrand = brandName ?? '';

  return (
    <header className="sticky top-0 z-99 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="group flex min-w-0 items-center gap-3 rounded-xl transition-transform duration-300 hover:scale-[1.01]"
          >
            <div className="flex w-24 items-center justify-center overflow-hidden rounded-md  text-accent">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={displayBrand}
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  quality={100}
                />
              ) : (
                <Car className="h-5 w-5" />
              )}
            </div>
              {!logoUrl && (
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold tracking-tight text-foreground">
                    {displayBrand}
                  </div>
                </div>
              )
              }
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = isActiveRoute(
                pathname,
                locale,
                item.href
              );

              return (
                <Link
                  key={item.href || 'home'}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="hidden xl:flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 text-accent" />
              <span dir="ltr">{contact.phone}</span>
            </div>

            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeSwitcher />
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-card/70 text-foreground transition-colors duration-200 hover:border-accent/40 hover:text-accent"
              aria-label={
                isOpen ? t('nav.close_menu') : t('nav.open_menu')
              }
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div
          className={cn(
            'grid overflow-hidden transition-all duration-300 lg:hidden',
            isOpen ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]'
          )}
        >
          <div className="min-h-0">
            <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <nav className="grid gap-2">
                {navItems.map((item) => {
                  const active = isActiveRoute(
                    pathname,
                    locale,
                    item.href
                  );

                  return (
                    <Link
                      key={item.href || 'mobile-home'}
                      href={`/${locale}${item.href}`}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                        active
                          ? 'bg-accent text-white shadow-lg shadow-accent/20'
                          : 'text-foreground hover:bg-muted/70'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 grid gap-3 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground" dir="ltr">
                    {contact.phone}
                  </div>
                  <LanguageSwitcher direction="up" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
