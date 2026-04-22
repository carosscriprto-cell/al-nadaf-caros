import type { Metadata } from "next";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { seoConfig } from '@/config';

export const metadata: Metadata = {
  title: seoConfig.defaultTitle,
  description: seoConfig.description,
  keywords: seoConfig.keywords,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
