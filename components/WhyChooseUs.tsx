'use client';

import { motion } from 'framer-motion';
import { Shield, Clock, Star, Car, Users, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';
import HeadSection from './HeadSection';

const WhyChooseUs = () => {
  const t = useTranslations();

  const benefits = [
    {
      icon: Shield,
      title: t('why_choose_us.safe'),
      description: t('why_choose_us.safe_desc'),
    },
    {
      icon: Clock,
      title: t('why_choose_us.service'),
      description: t('why_choose_us.service_desc'),
    },
    {
      icon: Star,
      title: t('why_choose_us.quality'),
      description: t('why_choose_us.quality_desc'),
    },
    {
      icon: Car,
      title: t('why_choose_us.selection'),
      description: t('why_choose_us.selection_desc'),
    },
    {
      icon: Users,
      title: t('why_choose_us.drivers'),
      description: t('why_choose_us.drivers_desc'),
    },
    {
      icon: Award,
      title: t('why_choose_us.awards'),
      description: t('why_choose_us.awards_desc'),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <HeadSection
          title={t('why_choose_us.title')}
          description={t('why_choose_us.description')}
          divider={true}
        />

        {/* Benefits */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.07 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative h-full overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-accent/30 hover:shadow-2xl">
                  {/* Glow */}
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-accent/20" />

                  <div className="relative z-10 flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-accent md:text-xl">
                          {benefit.title}
                        </h3>

                        <span className="text-xs font-medium text-muted-foreground/60 transition-opacity duration-300 group-hover:opacity-0">
                          0{index + 1}
                        </span>
                      </div>

                      <p className="text-sm leading-7 text-muted-foreground md:text-base">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative mt-16 overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-8 backdrop-blur-xl md:p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5" />

          <div className="relative z-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '500+', label: 'Happy Customers' },
              { value: '50+', label: 'Premium Vehicles' },
              { value: '24/7', label: 'Service Available' },
              { value: '4.9', label: 'Customer Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 text-3xl font-bold text-accent md:text-5xl">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div> */}
      </div>
    </section>
  );
};

export default WhyChooseUs;