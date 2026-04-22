'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import HeadSection from '../HeadSection';
import { useTranslations } from 'next-intl';

const TestimonialsSection = () => {
  const t = useTranslations();
  const testimonials = t.raw('testimonials.items') as Array<{
    id: number;
    name: string;
    role: string;
    content: string;
    rating: number;
  }>;

  return (
    <section className="relative overflow-hidden bg-background py-20">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <HeadSection
          title={t('testimonials.title')}
          description={t('testimonials.description')}
          divider={true}
        />

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: index * 0.07 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 backdrop-blur-xl"
            >
              {/* Glow */}
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-accent/20" />

              <div className="relative z-10">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="h-8 w-8 text-accent/60" />
                </div>

                {/* Rating */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="mb-6 text-foreground">
                  &quot;{testimonial.content}&quot;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                    {/* Placeholder for avatar */}
                    <div className="flex h-full items-center justify-center bg-accent/10 text-accent font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
