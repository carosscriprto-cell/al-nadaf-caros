'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PageHeroProps {
  badge?: string;
  title: string;
  highlight: string;
  description?: string;
  secondaryDescription?: string;

  primaryButton?: {
    label: string;
    href: string;
  };

  secondaryButton?: {
    label: string;
    href: string;
  };

  children?: React.ReactNode;
}

export default function PageHero({
  badge,
  title,
  highlight,
  description,
  secondaryDescription,
  primaryButton,
  secondaryButton,
  children,
}: PageHeroProps) {
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          {badge && (
            <div className="mb-4 inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              {badge}
            </div>
          )}

          {/* Title */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {title}
            <span className="block text-accent">{highlight}</span>
          </h1>

          {/* Descriptions */}
          {description && (
            <p className="mb-5 text-lg leading-8 text-muted-foreground">
              {description}
            </p>
          )}

          {secondaryDescription && (
            <p className="text-lg leading-8 text-muted-foreground">
              {secondaryDescription}
            </p>
          )}

          {/* Actions */}
          {(primaryButton || secondaryButton) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {primaryButton && (
                <Link
                  href={primaryButton.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition hover:scale-105"
                >
                  {primaryButton.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {secondaryButton && (
                <Link
                  href={secondaryButton.href}
                  className="rounded-xl border border-border px-6 py-3 font-semibold transition hover:bg-muted"
                >
                  {secondaryButton.label}
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative w-full min-w-0 overflow-hidden"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}