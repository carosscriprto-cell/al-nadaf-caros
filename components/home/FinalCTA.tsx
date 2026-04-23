'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getBlurDataURL } from '@/lib/image';

const FinalCTA = () => {
  const locale = useLocale();
  const tb = useTranslations('buttons')
  const t = useTranslations('');

  return (
    <section className="relative overflow-hidden py-20 mx-4 rounded-2xl text-white bg-transparent">
      
      {/* 🔥 Background Image (Subtle) */}
      <div className="absolute inset-0">
        <Image
          src="/hero/buy.png"
          alt="fleet"
          fill
          sizes="100vw"
          quality={68}
          placeholder="blur"
          blurDataURL={getBlurDataURL('#111827', '#1f2937')}
          className="object-cover opacity-20 scale-105"
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/80" />
        
        {/* Soft gradient (NOT aggressive) */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/60 via-accent/40 to-accent/70" />
      </div>

      {/* 🔥 Glow Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold md:text-5xl"
          >
            {t('final_cta.title')}
          </motion.h2>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-white/70 text-lg"
          >
            {t('final_cta.description')}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            {/* Primary */}
            <Link
              href={`/${locale}/fleet`}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-accent px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {tb('start_your_journey')}
              <ArrowRight className="h-5 w-5" />
            </Link>

            {/* Secondary */}
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-accent hover:scale-105"
            >
              {tb('contact_us')}
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
