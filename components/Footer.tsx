import Link from 'next/link';
import { Car, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations();
  return (
    <footer className="bg-card text-card-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-accent" />
              <span className="text-2xl font-bold">Caros</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('footer.company')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold">{t('footer.our_services')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  {t('services.airport_transfer')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  {t('services.intercity_trips')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  {t('services.wedding_events')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  {t('services.business_meetings')}
                </Link>
              </li>
              <li>
                <Link href="/rental" className="hover:text-accent transition-colors">
                  {t('services.car_rental')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold">{t('footer.quick_links')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-accent transition-colors">
                  {t('footer.about_us')}
                </Link>
              </li>
              <li>
                <Link href="/fleet" className="hover:text-accent transition-colors">
                  {t('footer.our_fleet')}
                </Link>
              </li>
              <li>
                <Link href="/sales" className="hover:text-accent transition-colors">
                  {t('footer.cars_for_sale')}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-accent transition-colors">
                  {t('footer.book_now')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.contact_info')}</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-accent" />
                <span>{t('footer.phone')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-accent" />
                <span>{t('footer.email')}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-accent mt-1" />
                <span>{t('footer.address')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Caros. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 