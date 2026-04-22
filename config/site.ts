export type LocaleCode = 'en' | 'ar';

interface LocalizedAddress {
  line1: string;
  line2: string;
  full: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    localizedName: Record<LocaleCode, string>;
    tagline: string;
  };
  media: {
    logoMark: string;
    ogImage: string;
  };
  contact: {
    phone: {
      display: string;
      raw: string;
      supportDisplay?: string;
      supportRaw?: string;
    };
    whatsapp: {
      raw: string;
    };
    email: {
      primary: string;
      support?: string;
    };
    address: {
      line1: string;
      line2: string;
      full: string;
      localized: Record<LocaleCode, LocalizedAddress>;
    };
    businessHours: {
      weekdays: string;
      weekends: string;
    };
  };
  map: {
    center: [number, number];
    zoom: number;
    country: Record<LocaleCode, string>;
    coverageCities: Array<{
      name: Record<LocaleCode, string>;
      position: [number, number];
      logo: string;
    }>;
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  urls: {
    website: string;
    privacy: string;
    terms: string;
  };
  legal: {
    copyrightStartYear: number;
  };
}

export const siteConfig: SiteConfig = {
  brand: {
    name: 'Caros',
    localizedName: {
      en: 'Caros',
      ar: '\u0643\u0627\u0631\u0648\u0633',
    },
    tagline:
      'Premium car rental, vehicle sales, and chauffeur-ready transportation services.',
  },
  media: {
    logoMark: 'Car',
    ogImage: '/og-image.jpg',
  },
  contact: {
    phone: {
      display: '+1 (555) 123-4567',
      raw: '+15551234567',
      supportDisplay: '+1 (555) 123-4568',
      supportRaw: '+15551234568',
    },
    whatsapp: {
      raw: '+15551234567',
    },
    email: {
      primary: 'info@caros.com',
      support: 'support@caros.com',
    },
    address: {
      line1: '123 Main Street',
      line2: 'City, State 12345',
      full: '123 Main Street, City, State 12345',
      localized: {
        en: {
          line1: '123 Main Street',
          line2: 'City, State 12345',
          full: '123 Main Street, City, State 12345',
        },
        ar: {
          line1: '123 شارع مين',
          line2: 'المدينة، الولاية 12345',
          full: '123 شارع مين، المدينة، الولاية 12345',
        },
      },
    },
    businessHours: {
      weekdays: 'Monday - Friday: 8:00 AM - 8:00 PM',
      weekends: 'Saturday - Sunday: 9:00 AM - 6:00 PM',
    },
  },
  map: {
    center: [52.1326, 5.2913],
    zoom: 7,
    country: {
      en: 'the Netherlands',
      ar: 'هولندا',
    },
    coverageCities: [
      {
        name: {
          en: 'Amsterdam',
          ar: 'أمستردام',
        },
        position: [52.3676, 4.9041],
        logo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100',
      },
      {
        name: {
          en: 'Rotterdam',
          ar: 'روتردام',
        },
        position: [51.9244, 4.4777],
        logo: 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=100',
      },
      {
        name: {
          en: 'Utrecht',
          ar: 'أوترخت',
        },
        position: [52.0907, 5.1214],
        logo: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=100',
      },
      {
        name: {
          en: 'Eindhoven',
          ar: 'آيندهوفن',
        },
        position: [51.4416, 5.4697],
        logo: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=100',
      },
    ],
  },
  social: {
    facebook: 'https://facebook.com/caros',
    twitter: 'https://twitter.com/caros',
    instagram: 'https://instagram.com/caros',
    linkedin: 'https://linkedin.com/company/caros',
  },
  urls: {
    website: 'https://caros.com',
    privacy: '/privacy',
    terms: '/terms',
  },
  legal: {
    copyrightStartYear: 2026,
  },
};
