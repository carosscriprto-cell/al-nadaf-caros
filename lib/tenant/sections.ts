// lib/tenant/sections.ts
// Per-tenant storefront home section config (P6 white-label). Parses the
// `tenants.sections` jsonb into an ordered show/hide list, with a canonical
// default so existing tenants (null sections) render the full home as before.

export const HOME_SECTIONS = [
  'hero',
  'brandShowcase',
  'featuredCars',
  'whyChooseUs',
  'howItWorks',
  'featuredSpotlight',
  'faq',
  'finalCta',
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number];

export type SectionConfig = { key: HomeSectionKey; enabled: boolean };

// The hero is the storefront's identity — it can be reordered but not hidden.
const ALWAYS_ON: readonly HomeSectionKey[] = ['hero'];

// Canonical default: every section on, in declaration order.
export const DEFAULT_SECTIONS: SectionConfig[] = HOME_SECTIONS.map((key) => ({ key, enabled: true }));

const isKey = (v: unknown): v is HomeSectionKey =>
  typeof v === 'string' && (HOME_SECTIONS as readonly string[]).includes(v);

// Normalize raw jsonb → ordered SectionConfig[]. Tolerates:
//   * [{ key, enabled }]        (canonical)
//   * ["hero","featuredCars"]   (bare keys → enabled)
// Unknown/duplicate keys are dropped; any canonical section missing from the
// stored config is appended (enabled) so new sections appear by default.
export function parseSections(raw: unknown): SectionConfig[] {
  const arr = Array.isArray(raw) ? raw : [];
  const seen = new Set<HomeSectionKey>();
  const out: SectionConfig[] = [];

  for (const item of arr) {
    let key: unknown;
    let enabled = true;
    if (typeof item === 'string') {
      key = item;
    } else if (item && typeof item === 'object') {
      key = (item as Record<string, unknown>).key;
      enabled = (item as Record<string, unknown>).enabled !== false;
    }
    if (isKey(key) && !seen.has(key)) {
      seen.add(key);
      out.push({ key, enabled: ALWAYS_ON.includes(key) ? true : enabled });
    }
  }

  for (const key of HOME_SECTIONS) {
    if (!seen.has(key)) out.push({ key, enabled: true });
  }
  return out;
}

// Render order for the storefront: enabled sections only. All current sections
// (including featuredSpotlight) work for every tenant type, so no feature gate
// is applied here — visibility is purely the per-tenant toggle.
export function resolveVisibleSections(raw: unknown): HomeSectionKey[] {
  return parseSections(raw)
    .filter((s) => s.enabled)
    .map((s) => s.key);
}

// Is a given section editable (can the owner toggle it off)?
export function isSectionLocked(key: HomeSectionKey): boolean {
  return ALWAYS_ON.includes(key);
}
