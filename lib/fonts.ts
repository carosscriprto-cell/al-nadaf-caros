// lib/fonts.ts — Caros dashboard typography (Cairo + IBM Plex Sans Arabic).
// Both carry Arabic + Latin glyphs, so they render EN and AR consistently.
import { Cairo, IBM_Plex_Sans_Arabic, Space_Grotesk } from 'next/font/google';

export const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

export const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-arabic',
  display: 'swap',
});

// Storefront display face — geometric grotesk with an engineered, automotive
// character. Used only for hero/headline display type (Latin); Arabic falls
// back to IBM Plex Sans Arabic via the --font-heading stack in globals.css.
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
