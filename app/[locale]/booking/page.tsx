'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, User, MapPin, Users } from 'lucide-react';
import { useState } from 'react';

const bookingSchema = z.object({
  serviceType: z.enum(['airport-transfer', 'intercity-trip', 'wedding-event', 'business-meeting', 'car-rental']),
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  pickupDate: z.string().min(1, 'Please select pickup date'),
  pickupTime: z.string().min(1, 'Please select pickup time'),
  returnDate: z.string().optional(),
  returnTime: z.string().optional(),
  pickupLocation: z.string().min(1, 'Please enter pickup location'),
  dropoffLocation: z.string().min(1, 'Please enter dropoff location'),
  passengers: z.number().min(1).max(10),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(1, 'Phone number is required'),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const serviceType = watch('serviceType');

  const services = [
    {
      id: 'airport-transfer',
      name: 'Airport Transfer',
      description: 'Reliable airport pickup and drop-off',
      icon: Car,
      color: 'bg-accent',
    },
    {
      id: 'intercity-trip',
      name: 'Intercity Trip',
      description: 'Long-distance travel between cities',
      icon: MapPin,
      color: 'bg-accent',
    },
    {
      id: 'wedding-event',
      name: 'Wedding Event',
      description: 'Luxury transportation for special occasions',
      icon: Users,
      color: 'bg-accent',
    },
    {
      id: 'business-meeting',
      name: 'Business Meeting',
      description: 'Professional corporate transportation',
      icon: User,
      color: 'bg-accent',
    },
    {
      id: 'car-rental',
      name: 'Car Rental',
      description: 'Self-drive vehicle rental',
      icon: Car,
      color: 'bg-accent',
    },
  ];

  const vehicles = [
    { id: '1', name: 'BMW 5 Series', class: 'Luxury Sedan', price: 89, available: true },
    { id: '2', name: 'Mercedes E-Class', class: 'Executive Sedan', price: 95, available: true },
    { id: '3', name: 'Audi A6', class: 'Premium Sedan', price: 82, available: true },
    { id: '4', name: 'Range Rover Sport', class: 'Luxury SUV', price: 120, available: true },
    { id: '5', name: 'Tesla Model S', class: 'Electric Luxury', price: 110, available: true },
  ];

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Booking data:', data);
    setIsSubmitting(false);
    alert('Booking submitted successfully! We will contact you shortly.');
  };

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
              Book Your Ride
            </h1>
            <p className="text-xl text-accent-foreground/80 max-w-3xl mx-auto">
              Reserve your premium transportation service. Fill out the form below and we&apos;ll confirm your booking shortly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card rounded-2xl shadow-xl p-8 border border-border"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Service Type Selection */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Select Service Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => {
                        setValue('serviceType', service.id as BookingFormData['serviceType']);
                        setSelectedService(service.id);
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedService === service.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${service.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                          <service.icon className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.serviceType && (
                  <p className="text-red-500 text-sm mt-2">{errors.serviceType.message}</p>
                )}
              </div>

              {/* Vehicle Selection */}
              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-bold text-foreground mb-6">Select Vehicle</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        onClick={() => setValue('vehicleId', vehicle.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          watch('vehicleId') === vehicle.id
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-foreground">{vehicle.name}</h3>
                            <p className="text-sm text-muted-foreground">{vehicle.class}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-accent">${vehicle.price}</div>
                            <div className="text-sm text-muted-foreground">per day</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.vehicleId && (
                    <p className="text-red-500 text-sm mt-2">{errors.vehicleId.message}</p>
                  )}
                </motion.div>
              )}

              {/* Date and Time Selection */}
              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      {...register('pickupDate')}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                    />
                    {errors.pickupDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.pickupDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      {...register('pickupTime')}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                    />
                    {errors.pickupTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.pickupTime.message}</p>
                    )}
                  </div>

                  {serviceType === 'car-rental' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Return Date
                        </label>
                        <input
                          type="date"
                          {...register('returnDate')}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Return Time
                        </label>
                        <input
                          type="time"
                          {...register('returnTime')}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Location Details */}
              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter pickup address"
                      {...register('pickupLocation')}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                    />
                    {errors.pickupLocation && (
                      <p className="text-red-500 text-sm mt-1">{errors.pickupLocation.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Dropoff Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter dropoff address"
                      {...register('dropoffLocation')}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                    />
                    {errors.dropoffLocation && (
                      <p className="text-red-500 text-sm mt-1">{errors.dropoffLocation.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Passenger Count */}
              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Number of Passengers
                  </label>
                  <select
                    {...register('passengers', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </option>
                    ))}
                  </select>
                  {errors.passengers && (
                    <p className="text-red-500 text-sm mt-1">{errors.passengers.message}</p>
                  )}
                </motion.div>
              )}

              {/* Personal Information */}
              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-bold text-foreground mb-6">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your first name"
                        {...register('firstName')}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your last name"
                        {...register('lastName')}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        {...register('email')}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        {...register('phone')}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Special Requests
                    </label>
                    <textarea
                      placeholder="Any special requirements or requests..."
                      {...register('specialRequests')}
                      rows={4}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="pt-6"
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Booking'}
                  </button>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 