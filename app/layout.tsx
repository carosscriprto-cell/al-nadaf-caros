import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caros - Premium Car Rental & Transport Services",
  description: "Professional car rental, airport transfers, intercity trips, and transport services. Book your ride today!",
  keywords: "car rental, transport services, airport transfer, wedding cars, business transport",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 