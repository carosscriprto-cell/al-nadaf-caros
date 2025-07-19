'use client';

import { motion } from 'framer-motion';
import { Plane, MapPin, Heart, Users, Clock, Shield, Star, Check } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const services = [
    {
      icon: Plane,
      title: 'Airport Transfer',
      description: 'Reliable and comfortable airport pickup and drop-off services.',
      longDescription: 'Start or end your journey with style and comfort. Our airport transfer service ensures you arrive at your destination on time, every time. Whether you\'re traveling for business or pleasure, our professional drivers will make your airport experience seamless.',
      features: [
        'Meet & Greet Service',
        'Flight Monitoring',
        'Luggage Assistance',
        'Professional Drivers',
        'Clean & Comfortable Vehicles',
        'Fixed Pricing',
      ],
      price: 'From $49',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: MapPin,
      title: 'Intercity Trips',
      description: 'Long-distance travel with professional drivers and premium vehicles.',
      longDescription: 'Travel between cities in comfort and style. Our intercity service is perfect for business trips, family visits, or weekend getaways. Enjoy the journey with our spacious vehicles and experienced drivers who know the routes.',
      features: [
        'Long Distance Travel',
        'Multiple Vehicle Options',
        'Rest Stops Included',
        'Professional Navigation',
        'Comfortable Seating',
        'Entertainment Systems',
      ],
      price: 'From $89',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Heart,
      title: 'Wedding Events',
      description: 'Make your special day memorable with our luxury wedding cars.',
      longDescription: 'Your wedding day deserves nothing but the best. Our wedding transportation service provides elegant and luxurious vehicles to make your special day even more memorable. From the ceremony to the reception, we\'ll ensure you arrive in style.',
      features: [
        'Luxury Wedding Cars',
        'Professional Chauffeurs',
        'Decorated Vehicles',
        'Flexible Scheduling',
        'Photo Opportunities',
        'Guest Transportation',
      ],
      price: 'From $299',
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      icon: Users,
      title: 'Business Meetings',
      description: 'Professional transportation for corporate events and meetings.',
      longDescription: 'Impress your clients and colleagues with our professional business transportation service. Perfect for corporate events, client meetings, and executive travel. Our discreet and professional service ensures you arrive at your destination ready for business.',
      features: [
        'Executive Vehicles',
        'Professional Chauffeurs',
        'Business-Class Service',
        'Flexible Scheduling',
        'Corporate Accounts',
        'Meeting Support',
      ],
      price: 'From $79',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl text-accent-foreground/80 max-w-3xl mx-auto">
              Comprehensive transportation solutions tailored to meet all your needs. From airport transfers to special events, we&apos;ve got you covered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`${service.color} w-16 h-16 rounded-lg flex items-center justify-center`}>
                      <service.icon className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">{service.title}</h2>
                      <p className="text-accent font-semibold">{service.price}</p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    {service.longDescription}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-accent flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/booking"
                    className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    Book This Service
                  </Link>
                </div>

                {/* Visual */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className={`${service.bgColor} rounded-2xl p-8 h-80 flex items-center justify-center border border-border`}>
                    <div className="text-center">
                      <service.icon className="h-24 w-24 mx-auto mb-4 text-accent" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Services?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We go above and beyond to ensure your transportation experience is exceptional.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Punctual Service',
                description: 'We value your time and ensure you reach your destination on schedule.',
              },
              {
                icon: Shield,
                title: 'Safe & Secure',
                description: 'Your safety is our priority with well-maintained vehicles and professional drivers.',
              },
              {
                icon: Star,
                title: 'Premium Quality',
                description: 'Experience luxury and comfort with our high-quality vehicles and amenities.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-lg text-center border border-border"
              >
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent text-accent-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Book Your Ride?
            </h2>
            <p className="text-xl text-accent-foreground/80 mb-8 max-w-2xl mx-auto">
              Get in touch with us today to discuss your transportation needs and get a personalized quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/booking"
                className="bg-background text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-background/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Book Now
              </Link>
              <Link
                href="/contact"
                className="border-2 border-background text-background px-8 py-4 rounded-lg font-semibold hover:bg-background hover:text-foreground transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 