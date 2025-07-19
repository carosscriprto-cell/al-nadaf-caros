'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, Car, Phone } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useLocale, useTranslations } from 'next-intl';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations();

  const navItems = [
    { name: t('nav.home'), href: '' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.services'), href: '/services' },
    { name: t('nav.rental'), href: '/rental' },
    { name: t('nav.sales'), href: '/sales' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  return (
    <nav className="bg-background shadow-lg sticky top-0 z-50 border-b border-border" dir='ltr'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Car className="h-8 w-8 text-accent" />
            <Link href={`/${locale}/`} className="text-2xl font-bold text-foreground">
              Caros | كاروس
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/${locale}${item.href}`}
                  className="text-foreground hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <div className='flex gap-2 items-center'>
            <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center space-x-4"
          >
              <Link
                href={`/${locale}/booking`}
                className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <Phone className="h-4 w-4" />
                <span>{t('nav.book_now')}</span>
              </Link>
            </motion.div>

            {/* Theme Switcher */}
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-accent focus:outline-none focus:text-accent"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={`/${locale}${item.href}`}
                  className="text-foreground hover:text-accent block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href={`/${locale}/booking`}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-2 mt-4 shadow-md hover:shadow-lg"
                onClick={() => setIsOpen(false)}
              >
                <Phone className="h-4 w-4" />
                <span>{t('nav.book_now')}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 