'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Car, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="h-16 w-16 text-accent" />
            </div>
            <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
          </div>

          {/* Error Message */}
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. 
            Let&apos;s get you back on track to find your perfect ride.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/"
              className="w-full bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Home className="h-5 w-5" />
              <span>Go Home</span>
            </Link>
            
            <Link
              href="/en/fleet"
              className="w-full border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Browse Vehicles</span>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Looking for something specific?</p>
            <Link href="/contact" className="text-accent hover:text-accent/80 transition-colors">
              Contact our support team
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
