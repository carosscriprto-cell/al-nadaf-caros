import type { Metadata } from 'next';
import '../globals.css';
import 'leaflet/dist/leaflet.css';
import { seoConfig } from '@/config';

// Root layout for the (system) route group: dashboard, auth, and the global
// not-found / loading. Locale-independent (LTR, lang="en") — the storefront's
// localized <html lang dir> lives in app/(site)/[locale]/layout.tsx. This group
// owns its OWN <html>/<body>; there is no shared app/layout.tsx (multiple root
// layouts via route groups). suppressHydrationWarning keeps any <html> class
// mutation (e.g. theming) warning-free.
export const metadata: Metadata = {
  title: seoConfig.defaultTitle,
  // Private areas — keep them out of the index.
  robots: { index: false, follow: false },
};

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
