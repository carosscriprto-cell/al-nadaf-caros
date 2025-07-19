'use client';

import { motion } from 'framer-motion';
import { Shield, Clock, Star, Car, Users, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';

const WhyChooseUs = () => {
  const t = useTranslations();
  const benefits = [
    {
      icon: Shield,
      title: t('why_choose_us.safe'),
      description: t('why_choose_us.safe_desc'),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Clock,
      title: t('why_choose_us.service'),
      description: t('why_choose_us.service_desc'),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Star,
      title: t('why_choose_us.quality'),
      description: t('why_choose_us.quality_desc'),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Car,
      title: t('why_choose_us.selection'),
      description: t('why_choose_us.selection_desc'),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Users,
      title: t('why_choose_us.drivers'),
      description: t('why_choose_us.drivers_desc'),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Award,
      title: t('why_choose_us.awards'),
      description: t('why_choose_us.awards_desc'),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('why_choose_us.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {benefits[0].description}
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border border-border">
                {/* Icon */}
                <div className={`${benefit.bgColor} ${benefit.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors duration-200">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-card rounded-2xl p-8 shadow-lg border border-border"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">500+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">50+</div>
              <div className="text-muted-foreground">Premium Vehicles</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">24/7</div>
              <div className="text-muted-foreground">Service Available</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">4.9</div>
              <div className="text-muted-foreground">Customer Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs; 