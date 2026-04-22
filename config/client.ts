import { featureFlags, seoConfig, siteConfig } from './index';

export interface ClientConfig {
  brandName: string;
  brandNameAr: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  websiteUrl?: string;
  description?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: typeof featureFlags;
  social: typeof siteConfig.social;
  seo: {
    googleVerification?: string;
  };
}

// Backward-compatible bridge while components migrate to the new config modules.
export const clientConfig: ClientConfig = {
  brandName: siteConfig.brand.name,
  brandNameAr: siteConfig.brand.localizedName.ar,
  phone: siteConfig.contact.phone.display,
  whatsapp: siteConfig.contact.whatsapp.raw,
  email: siteConfig.contact.email.primary,
  address: siteConfig.contact.address.full,
  websiteUrl: siteConfig.urls.website,
  description: seoConfig.description,
  colors: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#3b82f6',
  },
  features: featureFlags,
  social: siteConfig.social,
  seo: {
    googleVerification: seoConfig.googleVerification,
  },
};
