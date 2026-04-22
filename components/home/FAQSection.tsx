'use client';

import { motion } from 'framer-motion';
import { PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { faqGroups, type FaqGroup } from '@/data/faq';

type Props = {
  group?: FaqGroup;
  showContactCta?: boolean;
};

const FAQSection = ({
  group = 'home',
  showContactCta = true,
}: Props) => {
  const tFaq = useTranslations('faq');
  const tButtons = useTranslations('buttons');

  const faqs = faqGroups[group].map((id) => ({
    id,
    question: tFaq(`items.${id}.question`),
    answer: tFaq(`items.${id}.answer`),
  }));

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            {tFaq(`${group}.badge`)}
          </div>

          <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            {tFaq(`${group}.title`)}
          </h2>

          <p className="text-lg text-muted-foreground">
            {tFaq(`${group}.description`)}
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-border/60 bg-card/80 p-8 backdrop-blur-xl transition-all duration-300 hover:border-accent/30"
            >
              <h3 className="mb-3 text-xl font-bold text-foreground">
                {faq.question}
              </h3>
              <p className="leading-7 text-muted-foreground">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>

        {showContactCta && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="mb-4 text-muted-foreground">
              {tFaq('cta.description')}
            </p>
            <Link
              href="tel:+971-XXX-XXXX"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-accent px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <span>{tButtons('call_now')}: +971-XXX-XXXX</span>
              <PhoneCall className="h-5 w-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
