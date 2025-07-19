'use client';

import { motion } from 'framer-motion';
import { Car, Star, Zap, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function SalesPage() {
  const carsForSale = [
    {
      id: 1,
      name: 'BMW 5 Series 2022',
      price: 45000,
      originalPrice: 52000,
      mileage: '15,000',
      year: '2022',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      features: ['Leather Seats', 'Navigation', 'Bluetooth', 'Backup Camera'],
      description: 'Excellent condition BMW 5 Series with low mileage. Full service history available.',
      image: '/api/placeholder/400/250',
      rating: 4.8,
      reviews: 24,
      location: 'New York, NY',
      contact: {
        phone: '+1 (555) 123-4567',
        email: 'sales@caros.com',
      },
    },
    {
      id: 2,
      name: 'Mercedes E-Class 2021',
      price: 42000,
      originalPrice: 48000,
      mileage: '22,000',
      year: '2021',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      features: ['Premium Sound', 'Heated Seats', 'Parking Sensors', 'LED Headlights'],
      description: 'Well-maintained Mercedes E-Class with premium features. Single owner vehicle.',
      image: '/api/placeholder/400/250',
      rating: 4.7,
      reviews: 18,
      location: 'Los Angeles, CA',
      contact: {
        phone: '+1 (555) 123-4568',
        email: 'sales@caros.com',
      },
    },
    {
      id: 3,
      name: 'Audi A6 2023',
      price: 55000,
      originalPrice: 62000,
      mileage: '8,500',
      year: '2023',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      features: ['Virtual Cockpit', 'Quattro AWD', 'Panoramic Roof', 'Wireless Charging'],
      description: 'Nearly new Audi A6 with cutting-edge technology and premium features.',
      image: '/api/placeholder/400/250',
      rating: 4.9,
      reviews: 12,
      location: 'Chicago, IL',
      contact: {
        phone: '+1 (555) 123-4569',
        email: 'sales@caros.com',
      },
    },
    {
      id: 4,
      name: 'Tesla Model 3 2022',
      price: 38000,
      originalPrice: 45000,
      mileage: '18,000',
      year: '2022',
      fuelType: 'Electric',
      transmission: 'Automatic',
      features: ['Autopilot', 'Supercharging', 'Glass Roof', 'Premium Interior'],
      description: 'Tesla Model 3 with enhanced autopilot and premium interior package.',
      image: '/api/placeholder/400/250',
      rating: 4.8,
      reviews: 31,
      location: 'San Francisco, CA',
      contact: {
        phone: '+1 (555) 123-4570',
        email: 'sales@caros.com',
      },
    },
    {
      id: 5,
      name: 'Range Rover Sport 2021',
      price: 65000,
      originalPrice: 75000,
      mileage: '25,000',
      year: '2021',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      features: ['Terrain Response', 'Meridian Sound', 'Heated Steering', 'Towing Package'],
      description: 'Luxury SUV with off-road capabilities and premium comfort features.',
      image: '/api/placeholder/400/250',
      rating: 4.6,
      reviews: 15,
      location: 'Miami, FL',
      contact: {
        phone: '+1 (555) 123-4571',
        email: 'sales@caros.com',
      },
    },
    {
      id: 6,
      name: 'Porsche 911 2020',
      price: 85000,
      originalPrice: 95000,
      mileage: '12,000',
      year: '2020',
      fuelType: 'Petrol',
      transmission: 'Manual',
      features: ['Sport Chrono', 'PASM', 'Porsche Sound', 'Carbon Fiber'],
      description: 'Iconic Porsche 911 in excellent condition with sport package and low mileage.',
      image: '/api/placeholder/400/250',
      rating: 4.9,
      reviews: 8,
      location: 'Las Vegas, NV',
      contact: {
        phone: '+1 (555) 123-4572',
        email: 'sales@caros.com',
      },
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
              Cars for Sale
            </h1>
            <p className="text-xl text-accent-foreground/80 max-w-3xl mx-auto">
              Own a piece of luxury. Browse our selection of premium vehicles available for purchase.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {carsForSale.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-border"
              >
                {/* Car Image */}
                <div className="relative h-64 bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                  <Car className="h-20 w-20 text-accent-foreground" />
                  <div className="absolute top-4 right-4 bg-background/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-accent fill-current" />
                      <span className="text-foreground text-sm font-medium">{car.rating}</span>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    SALE
                  </div>
                </div>

                {/* Car Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {car.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <span>{car.year}</span>
                        <span>•</span>
                        <span>{car.mileage} miles</span>
                        <span>•</span>
                        <span>{car.fuelType}</span>
                        <span>•</span>
                        <span>{car.transmission}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent">
                        ${car.price.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground line-through">
                        ${car.originalPrice.toLocaleString()}
                      </div>
                      <div className="text-accent font-semibold text-sm">
                        Save ${(car.originalPrice - car.price).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {car.description}
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {car.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-accent" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Location and Reviews */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{car.location}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {car.reviews} reviews
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`tel:${car.contact.phone}`}
                      className="flex items-center justify-center space-x-2 bg-accent text-accent-foreground px-4 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Now</span>
                    </a>
                    <a
                      href={`mailto:${car.contact.email}?subject=Inquiry about ${car.name}`}
                      className="flex items-center justify-center space-x-2 border-2 border-accent text-accent px-4 py-3 rounded-lg font-semibold hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Interested in a Vehicle?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Contact our sales team for more information, test drives, or to discuss financing options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Contact Sales
              </Link>
              <Link
                href="/rental"
                className="border-2 border-accent text-accent px-8 py-4 rounded-lg font-semibold hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                View Rental Fleet
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 