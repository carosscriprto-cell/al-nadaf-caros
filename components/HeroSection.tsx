'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Car, Shield, Clock } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslations } from 'next-intl';
import HomeBookingFormFields from './HomeBookingFormFields';

const HeroSection = () => {
  const t = useTranslations();
  const [selectedOption, setSelectedOption] = useState('distance');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  return (
    <section className="relative text-white min-h-[85vh] max-h-[80vh] flex items-center justify-center rounded-4xl overflow-hidden">
      {/* Full-width Background */}
      <div className="absolute inset-0 pointer-events-none rounded-4xl overflow-hidden">
        <Image 
          src="/hero-bg.png"
          alt='hero'
          fill
          className='rounded-4xl object-cover object-bottom'
          priority
        />
        <div className="absolute inset-0 bg-black/60 rounded-4xl" />
      </div>
      
      {/* Rounded Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 lg:pt-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="text-accent">{t('hero.welcome')}</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl text-blue-100 max-w-lg"
              >
                {t('hero.description')}
              </motion.p>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              <div className="flex items-center space-x-3">
                <Car className="h-6 w-6 text-accent" />
                <span className="text-sm">{t('hero.premium_fleet')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-accent" />
                <span className="text-sm">{t('hero.safe_secure')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-accent" />
                <span className="text-sm">{t('hero.service_247')}</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/booking"
                className="bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>{t('nav.book_now')}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/fleet"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-foreground transition-colors duration-200 flex items-center justify-center"
              >
                {t('nav.fleet')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative lg:sticky lg:top-8"
          >
            <div className="relative z-10">
              <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-6 border border-border/50 max-w-lg mx-auto lg:mx-0 shadow-2xl">
                <h3 className="text-2xl font-bold text-foreground mb-4">{t('booking.title')}</h3>
                
                {/* Option Tabs */}
                <div className="mb-4">
                  <div className="flex border-b border-border">
                    {[
                      { value: 'distance', label: t('booking.distance') },
                      { value: 'hourly', label: t('booking.hourly') },
                      { value: 'flat-rate', label: t('booking.flat_rate') }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedOption(option.value)}
                        className={`flex-1 px-3 py-2 text-md cursor-pointer rounded-md mb-1 font-medium transition-colors duration-200 border-b-2 ${
                          selectedOption === option.value
                            ? 'text-accent-foreground bg-accent/20 border-accent'
                            : 'text-foreground bg-transparent hover:bg-muted border-transparent hover:text-accent'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
                  </div>

                {/* Dynamic Form Fields */}
                <div className="mb-4">
                  <HomeBookingFormFields
                    selectedOption={selectedOption}
                    date={date}
                    setDate={setDate}
                    time={time}
                    setTime={setTime}
                    t={t}
                  />
                </div>

                {/* Submit Button */}
                <button className="w-full cursor-pointer bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm shadow-md hover:shadow-lg">
                  <span>{t("booking.searchbtn")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 