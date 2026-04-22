export type CarContentOverview = {
  idealFor?: string[];
  pros?: string[];
  cons?: string[];
};

export type CarContentEntry = {
  title: string;
  shortDescription?: string;
  description?: string;
  overview?: CarContentOverview;
  features?: string[];
  comfortFeatures?: string[];
  safetyFeatures?: string[];
  entertainmentFeatures?: string[];
  requirements?: string[];
  includedServices?: string[];
  warranty?: string;
};

export type CarContentMap = Record<string, CarContentEntry>;
export type CarContentLocale = 'ar' | 'en';
