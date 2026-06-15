// lib/fonts.ts — Caros dashboard typography (Cairo + IBM Plex Sans Arabic).
// Both carry Arabic + Latin glyphs, so they render EN and AR consistently.
import { Cairo, IBM_Plex_Sans_Arabic } from 'next/font/google';

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
