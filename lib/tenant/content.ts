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
// Hard cap on tenant-supplied FAQ rows (defensive: ignore anything beyond this).
export const MAX_FAQ = 15;
// Static i18n keys per slot — used by the storefront resolver for fallback.
export const WHY_KEYS = ['safe', 'service', 'quality', 'selection', 'drivers', 'awards'] as const;
export const HOW_KEYS = ['choose', 'book', 'delivery', 'drive'] as const;

export type ContentItem = { title?: string; text?: string };
export type SectionLocale = { title?: string; description?: string; items?: ContentItem[] };
export type AboutLocale = { heading?: string; body?: string };
// Hero headline — two lines matching the storefront's i18n title (line2 = accent
// line). Every field optional; the storefront falls back to hero.* i18n per line.
export type HeroHeadline = { line1?: string; line2?: string };
export type HeroLocale = { badge?: string; headline?: HeroHeadline; subheadline?: string };
// Generic title + description + single CTA label (financing / finalCta banners).
export type CtaLocale = { title?: string; desc?: string; cta?: string };
// One FAQ row; only rendered when both q & a are present (else falls back to static).
export type FaqEntry = { q?: string; a?: string };

export type TenantContent = {
  whyChooseUs: { en: SectionLocale; ar: SectionLocale };
  howItWorks: { en: SectionLocale; ar: SectionLocale };
  about: { en: AboutLocale; ar: AboutLocale };
  hero: { en: HeroLocale; ar: HeroLocale };
  financing: { en: CtaLocale; ar: CtaLocale };
  finalCta: { en: CtaLocale; ar: CtaLocale };
  faq: { en: FaqEntry[]; ar: FaqEntry[] };
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

// Headline: new shape is { line1, line2 }. Tolerate the OLD single-string headline
// gracefully — a tenant that already saved a string is read as line1 (no migration).
function parseHeadline(v: unknown): HeroHeadline | undefined {
  if (typeof v === 'string') {
    const line1 = str(v);
    return line1 ? { line1 } : undefined;
  }
  const o = rec(v);
  const line1 = str(o.line1);
  const line2 = str(o.line2);
  return line1 || line2 ? { line1, line2 } : undefined;
}

function parseHero(v: unknown): HeroLocale {
  const o = rec(v);
  return { badge: str(o.badge), headline: parseHeadline(o.headline), subheadline: str(o.subheadline) };
}

function parseCta(v: unknown): CtaLocale {
  const o = rec(v);
  return { title: str(o.title), desc: str(o.desc), cta: str(o.cta) };
}

// FAQ rows: tolerate non-arrays, cap at MAX_FAQ, drop fully-empty rows so a blank
// entry can never blank out a question on the storefront.
function parseFaq(v: unknown): FaqEntry[] {
  const arr = Array.isArray(v) ? v : [];
  const out: FaqEntry[] = [];
  for (const item of arr) {
    if (out.length >= MAX_FAQ) break;
    const o = rec(item);
    const q = str(o.q);
    const a = str(o.a);
    if (q || a) out.push({ q, a });
  }
  return out;
}

export function parseTenantContent(raw: unknown): TenantContent {
  const r = rec(raw);
  const why = rec(r.whyChooseUs);
  const how = rec(r.howItWorks);
  const about = rec(r.about);
  const hero = rec(r.hero);
  const financing = rec(r.financing);
  const finalCta = rec(r.finalCta);
  const faq = rec(r.faq);
  return {
    whyChooseUs: { en: parseSection(why.en, WHY_ITEMS), ar: parseSection(why.ar, WHY_ITEMS) },
    howItWorks: { en: parseSection(how.en, HOW_STEPS), ar: parseSection(how.ar, HOW_STEPS) },
    about: { en: parseAbout(about.en), ar: parseAbout(about.ar) },
    hero: { en: parseHero(hero.en), ar: parseHero(hero.ar) },
    financing: { en: parseCta(financing.en), ar: parseCta(financing.ar) },
    finalCta: { en: parseCta(finalCta.en), ar: parseCta(finalCta.ar) },
    faq: { en: parseFaq(faq.en), ar: parseFaq(faq.ar) },
  };
}

export const EMPTY_CONTENT: TenantContent = parseTenantContent(null);
