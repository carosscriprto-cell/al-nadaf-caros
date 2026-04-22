'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, MapPin, User, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { siteConfig } from '@/config';
import { cars } from '@/data/cars';
import { buildWhatsAppMessage } from '@/lib/buildWhatsAppMessage';

const serviceIcons = {
  'airport-transfer': Car,
  'intercity-trip': MapPin,
  'wedding-event': Users,
  'business-meeting': User,
  'car-rental': Car,
} as const;

export default function BookingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const locale = useLocale();
  const t = useTranslations('booking');

  const bookingSchema = z.object({
    serviceType: z.enum([
      'airport-transfer',
      'intercity-trip',
      'wedding-event',
      'business-meeting',
      'car-rental',
    ], { message: t('validation.service_type_required') }),
    vehicleId: z.string().min(1, t('validation.vehicle_required')),
    pickupDate: z.string().min(1, t('validation.pickup_date_required')),
    pickupTime: z.string().min(1, t('validation.pickup_time_required')),
    returnDate: z.string().optional(),
    returnTime: z.string().optional(),
    pickupLocation: z.string().min(1, t('validation.pickup_location_required')),
    dropoffLocation: z.string().min(1, t('validation.dropoff_location_required')),
    passengers: z.number().min(1).max(10),
    firstName: z.string().min(1, t('validation.first_name_required')),
    lastName: z.string().min(1, t('validation.last_name_required')),
    email: z.string().email(t('validation.email_invalid')),
    phone: z.string().min(1, t('validation.phone_required')),
    specialRequests: z.string().optional(),
  });

  type BookingFormData = z.infer<typeof bookingSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengers: 1,
    },
  });

  const serviceType = watch('serviceType');

  const services = useMemo(
    () =>
      (Object.keys(serviceIcons) as Array<keyof typeof serviceIcons>).map(
        (id) => ({
          id,
          name: t(`service_options.${id}.name`),
          description: t(`service_options.${id}.description`),
          icon: serviceIcons[id],
          color: 'bg-accent',
        })
      ),
    [t]
  );

  const vehicles = useMemo(
    () =>
      cars.slice(0, 5).map((car) => ({
        id: String(car.id),
        name: `${car.brand} ${car.model}`,
        class: car.class,
        price: car.pricing.daily ?? car.pricing.total ?? 0,
        available: car.available,
      })),
    []
  );

  const onSubmit = (values: BookingFormData) => {
    setIsSubmitting(true);

    const selectedCar = cars.find(
      (car) => String(car.id) === values.vehicleId
    );
    const intro =
      locale === 'ar'
        ? 'مرحباً، أود إرسال طلب حجز عبر واتساب.'
        : "Hello, I'd like to submit a booking request via WhatsApp.";
    const detailLabel =
      locale === 'ar' ? 'تفاصيل الحجز' : 'Booking Details';
    const serviceLabel =
      locale === 'ar' ? 'الخدمة' : 'Service';
    const pickupDateLabel =
      locale === 'ar' ? 'تاريخ الاستلام' : 'Pickup Date';
    const pickupTimeLabel =
      locale === 'ar' ? 'وقت الاستلام' : 'Pickup Time';
    const returnDateLabel =
      locale === 'ar' ? 'تاريخ الإرجاع' : 'Return Date';
    const returnTimeLabel =
      locale === 'ar' ? 'وقت الإرجاع' : 'Return Time';
    const pickupLocationLabel =
      locale === 'ar' ? 'موقع الاستلام' : 'Pickup Location';
    const dropoffLocationLabel =
      locale === 'ar' ? 'موقع التسليم' : 'Dropoff Location';
    const passengersLabel =
      locale === 'ar' ? 'الركاب' : 'Passengers';
    const nameLabel = locale === 'ar' ? 'الاسم' : 'Name';
    const emailLabel =
      locale === 'ar' ? 'البريد الإلكتروني' : 'Email';
    const phoneLabel =
      locale === 'ar' ? 'رقم الهاتف' : 'Phone';
    const notesLabel =
      locale === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes';

    const lines = [
      intro,
      '',
      selectedCar
        ? buildWhatsAppMessage({
            car: selectedCar,
            locale,
          })
        : '',
      '',
      `${detailLabel}:`,
      `${serviceLabel}: ${t(
        `service_options.${values.serviceType}.name`
      )}`,
      `${pickupDateLabel}: ${values.pickupDate}`,
      `${pickupTimeLabel}: ${values.pickupTime}`,
      values.returnDate
        ? `${returnDateLabel}: ${values.returnDate}`
        : '',
      values.returnTime
        ? `${returnTimeLabel}: ${values.returnTime}`
        : '',
      `${pickupLocationLabel}: ${values.pickupLocation}`,
      `${dropoffLocationLabel}: ${values.dropoffLocation}`,
      `${passengersLabel}: ${values.passengers}`,
      `${nameLabel}: ${values.firstName} ${values.lastName}`,
      `${emailLabel}: ${values.email}`,
      `${phoneLabel}: ${values.phone}`,
      values.specialRequests
        ? `${notesLabel}: ${values.specialRequests}`
        : '',
    ].filter(Boolean);

    const phone = siteConfig.contact.whatsapp.raw.replace(
      /[^0-9]/g,
      ''
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    reset();
    setSelectedService('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-accent to-accent/80 py-20 text-accent-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              {t('title')}
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-accent-foreground/80">
              {t('description')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-xl"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  {t('select_service_type')}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => {
                        setValue('serviceType', service.id);
                        setSelectedService(service.id);
                      }}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                        selectedService === service.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${service.color} flex h-10 w-10 items-center justify-center rounded-lg`}>
                          <service.icon className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {service.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.serviceType && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.serviceType.message}
                  </p>
                )}
              </div>

              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="mb-6 text-2xl font-bold text-foreground">
                    {t('select_vehicle')}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        onClick={() => setValue('vehicleId', vehicle.id)}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                          watch('vehicleId') === vehicle.id
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {vehicle.name}
                            </h3>
                            <p className="text-sm capitalize text-muted-foreground">
                              {vehicle.class}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-accent">
                              ${vehicle.price}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t('vehicle_card.per_day')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.vehicleId && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.vehicleId.message}
                    </p>
                  )}
                </motion.div>
              )}

              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {t('pickup_date')}
                    </label>
                    <input
                      type="date"
                      {...register('pickupDate')}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                    />
                    {errors.pickupDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.pickupDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {t('pickup_time')}
                    </label>
                    <input
                      type="time"
                      {...register('pickupTime')}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                    />
                    {errors.pickupTime && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.pickupTime.message}
                      </p>
                    )}
                  </div>

                  {serviceType === 'car-rental' && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          {t('return_date')}
                        </label>
                        <input
                          type="date"
                          {...register('returnDate')}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          {t('return_time')}
                        </label>
                        <input
                          type="time"
                          {...register('returnTime')}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {t('pickup_location')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('pickup_address_placeholder')}
                      {...register('pickupLocation')}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                    />
                    {errors.pickupLocation && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.pickupLocation.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {t('dropoff_location')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('dropoff_address_placeholder')}
                      {...register('dropoffLocation')}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                    />
                    {errors.dropoffLocation && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.dropoffLocation.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t('passengers')}
                  </label>
                  <select
                    {...register('passengers', { valueAsNumber: true })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? t('passenger_labels.one') : t('passenger_labels.other')}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}

              {serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="mb-6 text-2xl font-bold text-foreground">
                    {t('personal_information')}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        {t('first_name')} *
                      </label>
                      <input
                        type="text"
                        placeholder={t('first_name_placeholder')}
                        {...register('firstName')}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        {t('last_name')} *
                      </label>
                      <input
                        type="text"
                        placeholder={t('last_name_placeholder')}
                        {...register('lastName')}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        {t('email')} *
                      </label>
                      <input
                        type="email"
                        placeholder={t('email_placeholder')}
                        {...register('email')}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        {t('phone')} *
                      </label>
                      <input
                        type="tel"
                        placeholder={t('phone_placeholder')}
                        {...register('phone')}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {t('special_requests')}
                    </label>
                    <textarea
                      placeholder={t('special_requests_placeholder')}
                      {...register('specialRequests')}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-transparent focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </motion.div>
              )}

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
                    className="w-full rounded-lg bg-accent px-8 py-4 font-semibold text-accent-foreground shadow-lg transition-colors duration-200 hover:bg-accent/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? t('submitting') : t('submit')}
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
