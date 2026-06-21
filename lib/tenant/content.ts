// lib/tenant/content.ts
// Per-tenant editable text for the otherwise-static home/about sections (Site
// tab, P2.5-4b-2). Parses the `tenants.content` jsonb into a known bilingual
// shape; EVERY field is optional and the storefront falls back to the static
// i18n default when a field is empty/missing — so existing tenants and blank
// fields keep the current copy.

export type StoreLocale = 'en' | 'ar';

// Static slot counts (icons/order stay fixed; only text is editable).
export const WHY_ITEMS = 6;
export const HOW_STEPS = 4;
// Static i18n keys per slot — used by the storefront resolver for fallback.
export const WHY_KEYS = ['safe', 'service', 'quality', 'selection', 'drivers', 'awards'] as const;
export const HOW_KEYS = ['choose', 'book', 'delivery', 'drive'] as const;

export type ContentItem = { title?: string; text?: string };
export type SectionLocale = { title?: string; description?: string; items?: ContentItem[] };
export type AboutLocale = { heading?: string; body?: string };

export type TenantContent = {
  whyChooseUs: { en: SectionLocale; ar: SectionLocale };
  howItWorks: { en: SectionLocale; ar: SectionLocale };
  about: { en: AboutLocale; ar: AboutLocale };
};

const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});
const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

function parseItems(v: unknown, count: number): ContentItem[] {
  const arr = Array.isArray(v) ? v : [];
  const out: ContentItem[] = [];
  for (let i = 0; i < count; i++) {
    const o = rec(arr[i]);
    out.push({ title: str(o.title), text: str(o.text) });
  }
  return out;
}

function parseSection(v: unknown, count: number): SectionLocale {
  const o = rec(v);
  return { title: str(o.title), description: str(o.description), items: parseItems(o.items, count) };
}

function parseAbout(v: unknown): AboutLocale {
  const o = rec(v);
  return { heading: str(o.heading), body: str(o.body) };
}

export function parseTenantContent(raw: unknown): TenantContent {
  const r = rec(raw);
  const why = rec(r.whyChooseUs);
  const how = rec(r.howItWorks);
  const about = rec(r.about);
  return {
    whyChooseUs: { en: parseSection(why.en, WHY_ITEMS), ar: parseSection(why.ar, WHY_ITEMS) },
    howItWorks: { en: parseSection(how.en, HOW_STEPS), ar: parseSection(how.ar, HOW_STEPS) },
    about: { en: parseAbout(about.en), ar: parseAbout(about.ar) },
  };
}

export const EMPTY_CONTENT: TenantContent = parseTenantContent(null);
