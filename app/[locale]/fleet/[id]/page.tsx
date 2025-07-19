'use client';

import { Car, Star, Zap, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cars } from '../../../../data/cars';
import Image from 'next/image';

export default function FleetDetailPage() {
  const params = useParams();
  const carId = params.id as string;
  const car = cars.find(c => String(c.id) === carId);

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-4">The vehicle you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/rental"
            className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Browse All Vehicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/rental"
              className="inline-flex items-center space-x-2 text-accent-foreground/80 hover:text-accent-foreground transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Fleet</span>
            </Link>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {car.name}
                </h1>
                <p className="text-xl text-accent-foreground/80 mb-6">
                  {car.class} • {car.year} • {car.mileage} miles
                </p>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-accent fill-current" />
                    <span className="font-semibold">{car.rating}</span>
                    <span className="text-accent-foreground/80">({car.reviews} reviews)</span>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-6">
                  ${car.price} <span className="text-lg font-normal">per {car.per}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/booking"
                    className="bg-background text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-background/90 transition-colors duration-200 text-center shadow-lg hover:shadow-xl"
                  >
                    Book This Vehicle
                  </Link>
                  <a
                    href={`tel:${car.contact?.phone}`}
                    className="border-2 border-background text-background px-8 py-4 rounded-lg font-semibold hover:bg-background hover:text-foreground transition-colors duration-200 text-center"
                  >
                    Call Now
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-8 border border-background/20">
                  <div className="aspect-video bg-gradient-to-br from-accent/50 to-accent/30 rounded-lg flex items-center justify-center overflow-hidden">
                    {car.image ? (
                      <Image src={car.image} fill alt={car.name} className="object-cover object-center rounded-lg" />
                    ) : (
                      <Car className="h-32 w-32 text-accent-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Vehicle Details */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Vehicle Description</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  {car.description}
                </p>
                <h3 className="text-2xl font-bold text-foreground mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                {car.specifications && (
                  <>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {Object.entries(car.specifications).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-3">
                          <span className="font-semibold text-foreground w-40">{key}:</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Sidebar */}
            <div className="space-y-8">
              <div className="bg-accent/10 rounded-xl p-6 border border-accent/20">
                <h4 className="text-lg font-semibold mb-2 text-foreground">Contact & Location</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span className="text-foreground">{car.location}</span>
                </div>
                {car.contact && (
                  <>
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="h-5 w-5 text-accent" />
                      <span className="text-foreground">{car.contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-accent" />
                      <span className="text-foreground">{car.contact.email}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 