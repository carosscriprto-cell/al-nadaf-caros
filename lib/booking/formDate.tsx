export function formatDate(iso?: string, locale?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}