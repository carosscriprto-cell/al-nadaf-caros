'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plane, MapPin, Heart, Users, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ServicesPreview = () => {
  const t = useTranslations();
  const services = [
    {
      icon: Plane,
      title: t('services.airport_transfer'),
      description: t('services.airport_transfer_desc'),
      href: '/services',
      color: 'bg-accent',
    },
    {
      icon: MapPin,
      title: t('services.intercity_trips'),
      description: t('services.intercity_trips_desc'),
      href: '/services',
      color: 'bg-accent',
    },
    {
      icon: Heart,
      title: t('services.wedding_events'),
      description: t('services.wedding_events_desc'),
      href: '/services',
      color: 'bg-accent',
    },
    {
      icon: Users,
      title: t('services.business_meetings'),
      description: t('services.business_meetings_desc'),
      href: '/services',
      color: 'bg-accent',
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
            {t('services.section_header')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('services.section_description')}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={service.href}>
                <div className="relative bg-card max-h-[350px] min-h-[300px] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border border-border">
                  {/* Icon */}
                  <div className={`${service.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="h-8 w-8 text-accent-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors duration-200">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center absolute bottom-4 text-accent font-medium group-hover:translate-x-2 transition-transform duration-200">
                    <span>{t('services.learn_more')}</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/services"
            className="inline-flex items-center px-8 py-4 bg-accent text-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <span>{t('services.view_all')}</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesPreview; 