import { redirect } from 'next/navigation';

// Standalone Sales page removed (P5a storefront gating). Fleet is the single
// inventory page; hybrid tenants get a sale/rent filter there. Redirect keeps
// old links/bookmarks working.
export default async function SalesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/fleet`);
}
