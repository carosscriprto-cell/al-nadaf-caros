'use client';

import { motion } from 'framer-motion';
import { PhoneCall, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { faqIdsFor, type FaqGroup } from '@/data/faq';
import { useTenantContact } from '@/components/providers/TenantContactProvider';
import { useTenantContent } from '@/components/providers/TenantContentProvider';
import { useTenantFeatures } from '@/components/providers/TenantFeaturesProvider';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

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
  const locale = useLocale();
  const contact = useTenantContact();
  const content = useTenantContent();
  const features = useTenantFeatures();
  const phoneDigits = contact.phone.replace(/[^0-9+]/g, '');

  // Type-aware DEFAULT FAQ set (same mechanism as HowItWorks / H2a): sale-only →
  // sale questions, rental-only → rental questions, hybrid (or neither) → the
  // neutral generic set. The HOME tenant override (B1) below still wins; the
  // other groups have no override and use this default directly.
  const variant =
    features.enableSellCar && !features.enableRental
      ? 'sale'
      : features.enableRental && !features.enableSellCar
        ? 'rental'
        : 'generic';

  // The tenant FAQ override is a single shared dealer set applied to EVERY group
  // (home section, /faq page, about, contact) — a dealer who edits FAQ in the
  // dashboard sees those questions everywhere FAQ appears. Only rows with BOTH a
  // question and answer count (MAX_FAQ already capped in parseTenantContent); if
  // none qualify, fall back to the H2b type-aware default for the group, so the
  // storefront is unchanged when tenants.content.faq is empty/absent.
  const overrideFaqs = content.faq[locale === 'ar' ? 'ar' : 'en'].filter(
    (f): f is { q: string; a: string } => !!f.q && !!f.a,
  );

  const faqs = overrideFaqs.length
    ? overrideFaqs.map((f, i) => ({ id: `custom-${i}`, question: f.q, answer: f.a }))
    : faqIdsFor(group, variant).map((id) => ({
        id,
        question: tFaq(`items.${id}.question`),
        answer: tFaq(`items.${id}.answer`),
      }));

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            {tFaq(`${group}.title`)}
          </h2>

          <p className="text-lg text-muted-foreground">
            {tFaq(`${group}.description`)}
          </p>
        </div>

        {/* Accordion — click a question to expand/collapse. Native <details>
            with a shared `name` so only one stays open at a time (cleaner UX). */}
        <Accordion>
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              name={`faq-${group}`}
              className="group border-border/60 bg-card/80 shadow-none"
            >
              <AccordionTrigger className="list-none px-6 py-5 text-base font-bold text-foreground md:text-lg [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 pt-1">
                <p className="leading-7 text-muted-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

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
              href={`tel:${phoneDigits}`}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-accent px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <span>
                {tButtons('call_now')}: <span dir="ltr">{contact.phone}</span>
              </span>
              <PhoneCall className="h-5 w-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
