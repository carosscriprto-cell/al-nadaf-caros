import { siteConfig } from './site';

export interface SeoConfig {
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  locale: string;
  googleVerification?: string;
}

export const seoConfig: SeoConfig = {
  defaultTitle: `${siteConfig.brand.name} - Premium Car Rental & Sales`,
  titleTemplate: `%s | ${siteConfig.brand.name}`,
  description:
    'Experience luxury and reliability with a premium fleet for rentals, sales, airport transfers, and special events.',
  keywords: [
    'car rental',
    'luxury cars',
    'vehicle sales',
    'premium transportation',
    siteConfig.brand.name,
  ],
  locale: 'en_US',
  googleVerification: 'your-google-verification-code',
};
