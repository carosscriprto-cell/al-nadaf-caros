'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Cog,
  DoorOpen,
  Fuel,
  Gauge,
  GaugeCircle,
  MapPin,
  Settings2,
  Shield,
  Star,
  Users,
  Zap,
} from 'lucide-react';

import WhatsAppButton from '@/components/WhatsAppButton';
import VipDeliveryBadge from '@/components/VipDeliveryBadge';
import { clientConfig } from '@/config/client';
import type { Car } from '@/types/vehicles';
import {
  getCarTitleFallback,
  type CarContentEntry,
} from '@/data/cars-content';
import { getBlurDataURL } from '@/lib/image';
import ScrollToTopButton from '../ScrollToTopButton';

type SimilarCar = {
  car: Car;
  content?: CarContentEntry;
};

type FleetDetailClientProps = {
  car: Car;
  content?: CarContentEntry;
  locale: string;
  similarCars: SimilarCar[];
};

type TrustSignal = {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
};

export default function FleetDetailClient({
  car,
  content,
  locale,
  similarCars,
}: FleetDetailClientProps) {
  const t = useTranslations('car');
  const galleryImages = useMemo(
    () => (car.images.length ? car.images : [car.thumbnail]),
    [car.images, car.thumbnail]
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [displayedImage, setDisplayedImage] = useState(0);
  const [isMainImageLoading, setIsMainImageLoading] =
    useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(
    () => new Set(galleryImages.slice(0, 1))
  );
  const imageRequestRef = useRef(0);
  const [thumbnailsEmblaRef, thumbnailsEmblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: false,
    containScroll: 'trimSnaps',
  });

  const isRental =
    car.listingType === 'rent' || car.listingType === 'both';
  const isSale =
    car.listingType === 'sale' || car.listingType === 'both';
  const ctaIntent = isRental && isSale ? 'both' : isSale ? 'sale' : 'rent';
  const currency = car.pricing.currency || 'USD';
  const title = content?.title || getCarTitleFallback(car);
  const localeKey = locale === 'ar' ? 'ar' : 'en-US';
  const saleSavings =
    car.pricing.oldPrice && car.pricing.total
      ? car.pricing.oldPrice - car.pricing.total
      : null;

  const formatPrice = (value?: number) => {
    if (!value) return null;

    return new Intl.NumberFormat(localeKey, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (
    value?: number,
    maximumFractionDigits = 0
  ) => {
    if (value === undefined || value === null) return null;

    return new Intl.NumberFormat(localeKey, {
      maximumFractionDigits,
    }).format(value);
  };

  const enumLabel = (
    group:
      | 'category'
      | 'class'
      | 'condition'
      | 'drivetrain'
      | 'fuelType'
      | 'transmission',
    value: string
  ) => t(`detail.enums.${group}.${value}`);

  const localizedSpecs = {
    category: enumLabel('category', car.category),
    class: enumLabel('class', car.class),
    condition: enumLabel('condition', car.condition),
    fuelType: enumLabel('fuelType', car.fuelType),
    transmission: enumLabel(
      'transmission',
      car.transmission
    ),
    drivetrain: car.drivetrain
      ? enumLabel('drivetrain', car.drivetrain)
      : null,
  };

  const formatBoolean = (value: boolean) =>
    value ? t('detail.values.yes') : t('detail.values.no');

  const formatAcceleration = (value?: string) => {
    if (!value) return null;

    const match = value.match(/0-100 km\/h in ([\d.]+)s/i);

    if (!match) {
      return value;
    }

    return t('detail.formats.acceleration', {
      seconds: match[1],
    });
  };

  const getFuelRangePer20L = (value?: number) => {
    if (!value) return null;
    return Math.round((20 / value) * 100);
  };

  const trustSignals: TrustSignal[] = [
    car.rating && car.reviewsCount
      ? {
          icon: Star,
          text: t('detail.trust.rating_reviews', {
            rating: car.rating,
            count: car.reviewsCount,
          }),
        }
      : null,
    car.deliveryAvailable
      ? {
          icon: BadgeCheck,
          text: t('detail.trust.delivery_available'),
        }
      : null,
    car.ownershipHistory?.accidentFree
      ? {
          icon: Shield,
          text: t('detail.trust.accident_free'),
        }
      : null,
    car.ownershipHistory?.serviceHistory
      ? {
          icon: BadgeCheck,
          text: t('detail.trust.service_history'),
        }
      : null,
    content?.warranty
      ? {
          icon: BadgeCheck,
          text: content.warranty,
        }
      : null,
  ].filter(Boolean) as TrustSignal[];

  const merchandisingFlags = [
    car.isFeatured ? t('detail.flags.featured') : null,
    car.isPopular ? t('detail.flags.popular') : null,
    car.isNewArrival ? t('detail.flags.new_arrival') : null,
    car.isBestSeller ? t('detail.flags.best_seller') : null,
  ].filter(Boolean) as string[];

  const pricingSummaryRows = [
    isRental && car.pricing.securityDeposit
      ? {
          label: t('detail.labels.security_deposit'),
          value: formatPrice(car.pricing.securityDeposit),
        }
      : null,
    isRental && car.pricing.minimumRentalDays
      ? {
          label: t('detail.labels.minimum_rental_days'),
          value: t('detail.formats.days', {
            count: car.pricing.minimumRentalDays,
          }),
        }
      : null,
    isSale && car.pricing.monthlyInstallment
      ? {
          label: t('detail.labels.monthly_installment'),
          value: formatPrice(car.pricing.monthlyInstallment),
        }
      : null,
    isSale && car.pricing.negotiable !== undefined
      ? {
          label: t('detail.labels.price_negotiable'),
          value: formatBoolean(car.pricing.negotiable),
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string | null;
  }>;

  const includedServicesPreview =
    content?.includedServices?.slice(0, 3) ?? [];

  const rentalLink = `/${locale}/rental`;
  const salesLink = `/${locale}/sales`;
  const displayedImageSrc =
    galleryImages[displayedImage] || car.thumbnail;

  const markImageLoaded = useCallback((src: string) => {
    setLoadedImages((prev) => {
      if (prev.has(src)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);

  const preloadImage = useCallback(
    (src: string) =>
      new Promise<void>((resolve) => {
        if (typeof window === 'undefined' || loadedImages.has(src)) {
          resolve();
          return;
        }

        const image = new window.Image();
        image.src = src;

        const finalize = () => {
          markImageLoaded(src);
          resolve();
        };

        if (image.decode) {
          image.decode().then(finalize).catch(finalize);
          return;
        }

        image.onload = finalize;
        image.onerror = finalize;
      }),
    [loadedImages, markImageLoaded]
  );

  const handleImageChange = useCallback(
    async (index: number) => {
      if (index === displayedImage) {
        setSelectedImage(index);
        return;
      }

      const nextSrc = galleryImages[index] || car.thumbnail;
      const requestId = imageRequestRef.current + 1;
      imageRequestRef.current = requestId;
      setSelectedImage(index);
      setIsMainImageLoading(true);

      await preloadImage(nextSrc);

      if (imageRequestRef.current !== requestId) {
        return;
      }

      setDisplayedImage(index);
      setIsMainImageLoading(false);
    },
    [car.thumbnail, displayedImage, galleryImages, preloadImage]
  );

  useEffect(() => {
    setSelectedImage(0);
    setDisplayedImage(0);
    setIsMainImageLoading(false);
    imageRequestRef.current = 0;
    setLoadedImages(new Set(galleryImages.slice(0, 1)));
  }, [car.slug, galleryImages]);

  useEffect(() => {
    void preloadImage(displayedImageSrc);
  }, [displayedImageSrc, preloadImage]);

  useEffect(() => {
    const upcomingImages = [
      galleryImages[selectedImage + 1],
      galleryImages[selectedImage - 1],
    ].filter(Boolean) as string[];

    upcomingImages.forEach((src) => {
      void preloadImage(src);
    });
  }, [galleryImages, preloadImage, selectedImage]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="relative overflow-hidden border-b border-border/50 pb-14 pt-10 lg:pb-20 lg:pt-12">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href={isSale && !isRental ? salesLink : rentalLink}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('detail.back_to_vehicles')}
          </Link>

          <div className='mb-5 w-full items-center'>
            <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent capitalize">
                  {localizedSpecs.category}
                </span>

                <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary capitalize">
                  {localizedSpecs.class}
                </span>

                {car.available ? (
                  <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-500">
                    {t('detail.available_now')}
                  </span>
                ) : (
                  <span className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500">
                    {t('detail.unavailable')}
                  </span>
                )}

                {merchandisingFlags.map((flag) => (
                  <span
                    key={flag}
                    className="rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm font-medium text-foreground"
                  >
                    {flag}
                  </span>
                ))}
              </div>

              <div>
                <h1 className="text-4xl font-bold text-foreground lg:text-5xl">
                  {title}
                </h1>

                <p className="mt-3 text-lg text-muted-foreground">
                  {car.trim ? `${car.trim} / ` : ''}
                  {car.year} / {car.city}, {car.country}
                </p>

                {content?.shortDescription && (
                  <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                    {content.shortDescription}
                  </p>
                )}
              </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-2xl backdrop-blur-xl">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-muted">
                  <div
                    className={`absolute inset-0 z-10 transition-opacity duration-300 ${
                      isMainImageLoading
                        ? 'opacity-100'
                        : 'pointer-events-none opacity-0'
                    }`}
                  >
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-background/80 via-background/50 to-background/80" />
                  </div>
                  <Image
                    key={displayedImageSrc}
                    src={displayedImageSrc}
                    alt={title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    quality={80}
                    placeholder="blur"
                    blurDataURL={getBlurDataURL('#111827', '#1f2937')}
                    onLoad={() => {
                      markImageLoaded(displayedImageSrc);
                      setIsMainImageLoading(false);
                    }}
                    className={`object-cover transition duration-500 ${
                      isMainImageLoading ? 'scale-[1.015]' : 'scale-100'
                    }`}
                  />
                </div>

                {galleryImages.length > 1 &&
                  (galleryImages.length <= 4 ? (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {galleryImages.map(
                        (image: string, index: number) => (
                          <button
                            key={image}
                            onClick={() => void handleImageChange(index)}
                            aria-pressed={selectedImage === index}
                            className={`relative aspect-[4/3] overflow-hidden rounded-2xl border transition ${
                              selectedImage === index
                                ? 'border-accent ring-2 ring-accent/30'
                                : 'border-border/60'
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${title}-${index + 1}`}
                              fill
                              sizes="160px"
                              quality={64}
                              placeholder="blur"
                              blurDataURL={getBlurDataURL(
                                '#1f2937',
                                '#111827'
                              )}
                              className="object-cover"
                            />
                          </button>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="relative mt-4">
                     

                      <div
                        ref={thumbnailsEmblaRef}
                        className="overflow-hidden cursor-grab"
                      >
                        <div className="-ml-3 flex">
                          {galleryImages.map(
                            (image: string, index: number) => (
                              <div
                                key={image}
                                className="min-w-0 flex-[0_0_33.333%] pl-3 md:flex-[0_0_25%]"
                              >
                                <button
                                  onClick={() => void handleImageChange(index)}
                                  aria-pressed={selectedImage === index}
                                  className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl border transition ${
                                    selectedImage === index
                                      ? 'border-accent ring-2 ring-accent/30'
                                      : 'border-border/60'
                                  }`}
                                >
                                  <Image
                                    src={image}
                                    alt={`${title}-${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 33vw, 25vw"
                                    quality={64}
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL(
                                      '#1f2937',
                                      '#111827'
                                    )}
                                    className="object-cover"
                                  />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
                        {/* Left */}
                        <button
                          onClick={() => thumbnailsEmblaApi?.scrollPrev()}
                          className="
                            pointer-events-auto cursor-pointer
                            flex h-10 w-10 items-center justify-center
                            rounded-full
                            border border-border/60
                            bg-card/60 backdrop-blur-sm
                            shadow-md
                            transition
                            hover:-translate-y-0.5
                            hover:border-accent/40
                            hover:bg-accent
                            hover:text-white
                          "
                        >
                          <ChevronLeft size={18} />
                        </button>

                        {/* Right */}
                        <button
                          onClick={() => thumbnailsEmblaApi?.scrollNext()}
                          className="
                            pointer-events-auto cursor-pointer
                            flex h-10 w-10 items-center justify-center
                            rounded-full
                            border border-border/60
                            bg-card/60 backdrop-blur-sm
                            shadow-md
                            transition
                            hover:-translate-y-0.5
                            hover:border-accent/40
                            hover:bg-accent
                            hover:text-white
                          "
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {isRental && car.pricing.daily && (
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {t('detail.rental_price')}
                        </div>
                        <div className="mt-1 text-4xl font-bold text-foreground">
                          {formatPrice(car.pricing.daily)}
                          <span className="ml-2 text-lg font-normal text-muted-foreground">
                            / {t('detail.values.day')}
                          </span>
                        </div>
                      </div>
                    )}

                    {isSale && car.pricing.total && (
                      <div className={isRental ? 'mt-6' : ''}>
                        <div className="text-sm text-muted-foreground">
                          {t('detail.sale_price')}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <div className="text-4xl font-bold text-foreground">
                            {formatPrice(car.pricing.total)}
                          </div>

                          {car.pricing.oldPrice && (
                            <div className="text-lg text-muted-foreground line-through">
                              {formatPrice(car.pricing.oldPrice)}
                            </div>
                          )}
                        </div>

                        {saleSavings ? (
                          <div className="mt-2 text-sm font-medium text-emerald-600">
                            {t('detail.labels.savings', {
                              value: formatPrice(saleSavings)!,
                            })}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <VipDeliveryBadge />
                </div>

                {trustSignals.length ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {trustSignals.map(({ icon: Icon, text }) => (
                      <TrustChip
                        key={text}
                        icon={Icon}
                        text={text}
                      />
                    ))}
                  </div>
                ) : null}

                {isRental && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {car.pricing.weekly && (
                      <PriceBox
                        title={t('detail.weekly')}
                        value={formatPrice(car.pricing.weekly)!}
                      />
                    )}

                    {car.pricing.monthly && (
                      <PriceBox
                        title={t('detail.monthly')}
                        value={formatPrice(car.pricing.monthly)!}
                      />
                    )}

                    {car.pricing.hourly && (
                      <PriceBox
                        title={t('detail.hourly')}
                        value={formatPrice(car.pricing.hourly)!}
                      />
                    )}
                  </div>
                )}

                {pricingSummaryRows.length ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {pricingSummaryRows.map((row) => (
                      <SummaryPill
                        key={row.label}
                        label={row.label}
                        value={row.value || '-'}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-4">
                  {clientConfig.features.enableWhatsApp && (
                    <WhatsAppButton
                      car={car}
                      content={content}
                      className="flex-1 flex items-center justify-center w-full gap-2 rounded-2xl 
                      bg-[#25D366] py-3 text-[14px] font-semibold text-white  truncate
                      shadow-lg shadow-[#25D366]/20 
                      transition-all duration-300 
                      hover:scale-[1.02] hover:shadow-xl hover:shadow-[#25D366]/30"
                    >
                      {isRental
                        ? t('actions.book_now')
                        : isSale
                        ? t('actions.buy_now')
                        : t('actions.contact_now')}
                          <Image 
                            src="/WhatsApp.png" 
                            alt="WhatsApp" 
                            width={24} 
                            height={24} 
                            loading="lazy"
                          />  
                    </WhatsAppButton>
                  )}

                  <p className="text-sm leading-6 text-muted-foreground">
                    {t('detail.cta.helper', { intent: ctaIntent })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <CardSection title={t('detail.vehicle_specifications')}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Spec
                  icon={Calendar}
                  label={t('detail.labels.year')}
                  value={String(car.year)}
                />
                <Spec
                  icon={Settings2}
                  label={t('detail.labels.transmission')}
                  value={localizedSpecs.transmission}
                />
                <Spec
                  icon={Fuel}
                  label={t('detail.labels.fuel_type')}
                  value={localizedSpecs.fuelType}
                />
                <Spec
                  icon={Users}
                  label={t('detail.labels.seats')}
                  value={t('detail.formats.seats', {
                    count: car.seats,
                  })}
                />
                <Spec
                  icon={DoorOpen}
                  label={t('detail.labels.doors')}
                  value={String(car.doors)}
                />
                {car.engine && (
                  <Spec
                    icon={Zap}
                    label={t('detail.labels.engine')}
                    value={car.engine}
                  />
                )}
                {car.horsepower && (
                  <Spec
                    icon={GaugeCircle}
                    label={t('detail.labels.horsepower')}
                    value={t('detail.formats.horsepower', {
                      value: car.horsepower,
                    })}
                  />
                )}
                {car.torque && (
                  <Spec
                    icon={Zap}
                    label={t('detail.labels.torque')}
                    value={t('detail.formats.torque', {
                      value: formatNumber(car.torque)!,
                    })}
                  />
                )}
                {car.cylinders && (
                  <Spec
                    icon={Cog}
                    label={t('detail.labels.cylinders')}
                    value={t('detail.formats.cylinders', {
                      value: car.cylinders,
                    })}
                  />
                )}
                {car.topSpeed && (
                  <Spec
                    icon={Gauge}
                    label={t('detail.labels.top_speed')}
                    value={t('detail.formats.speed', {
                      value: car.topSpeed,
                    })}
                  />
                )}
                {car.acceleration && (
                  <Spec
                    icon={Gauge}
                    label={t('detail.labels.acceleration')}
                    value={formatAcceleration(car.acceleration)!}
                  />
                )}
                {localizedSpecs.drivetrain && (
                  <Spec
                    icon={Cog}
                    label={t('detail.labels.drivetrain')}
                    value={localizedSpecs.drivetrain}
                  />
                )}
                {car.fuelTankCapacity && (
                  <Spec
                    icon={Fuel}
                    label={t('detail.labels.fuel_tank_capacity')}
                    value={t('detail.formats.fuel_tank_capacity', {
                      value: formatNumber(car.fuelTankCapacity)!,
                    })}
                  />
                )}
                <Spec
                  icon={MapPin}
                  label={t('detail.labels.location')}
                  value={`${car.city}, ${car.country}`}
                />
                {car.address && (
                  <Spec
                    icon={MapPin}
                    label={t('detail.labels.address')}
                    value={car.address}
                  />
                )}
                <Spec
                  icon={Gauge}
                  label={t('detail.labels.mileage')}
                  value={t('detail.formats.distance', {
                    value: car.mileage.toLocaleString(localeKey),
                  })}
                />
              </div>
            </CardSection>

            {content?.description && (
              <CardSection title={t('detail.description')}>
                <p className="text-lg leading-8 text-muted-foreground">
                  {content.description}
                </p>
              </CardSection>
            )}

            {content?.features?.length ? (
              <CardSection title={t('detail.features')}>
                <div className="grid gap-4 md:grid-cols-2">
                  {content.features.map((feature) => (
                    <FeatureItem key={feature} text={feature} />
                  ))}
                </div>
              </CardSection>
            ) : null}

            {content?.entertainmentFeatures?.length ? (
              <CardSection title={t('detail.entertainment_features')}>
                <div className="grid gap-4 md:grid-cols-2">
                  {content.entertainmentFeatures.map((feature) => (
                    <FeatureItem key={feature} text={feature} />
                  ))}
                </div>
              </CardSection>
            ) : null}

            {content?.overview &&
            (content.overview.idealFor?.length ||
              content.overview.pros?.length ||
              content.overview.cons?.length) ? (
              <CardSection title={t('detail.quick_highlights')}>
                <div className="grid gap-6 md:grid-cols-3">
                  {content.overview.idealFor?.length ? (
                    <OverviewList
                      title={t('detail.ideal_for')}
                      items={content.overview.idealFor}
                    />
                  ) : null}
                  {content.overview.pros?.length ? (
                    <OverviewList
                      title={t('detail.pros')}
                      items={content.overview.pros}
                    />
                  ) : null}
                  {content.overview.cons?.length ? (
                    <OverviewList
                      title={t('detail.cons')}
                      items={content.overview.cons}
                    />
                  ) : null}
                </div>
              </CardSection>
            ) : null}

            {isRental && (
              <CardSection title={t('detail.rental_details')}>
                <div className="space-y-4">
                  {car.pricing.securityDeposit && (
                    <OverviewRow
                      label={t('detail.labels.security_deposit')}
                      value={formatPrice(car.pricing.securityDeposit)!}
                    />
                  )}

                  {car.pricing.minimumRentalDays && (
                    <OverviewRow
                      label={t(
                        'detail.labels.minimum_rental_days'
                      )}
                      value={t('detail.formats.days', {
                        count: car.pricing.minimumRentalDays,
                      })}
                    />
                  )}

                  {car.deliveryAvailable !== undefined && (
                    <OverviewRow
                      label={t('detail.labels.delivery_available')}
                      value={formatBoolean(car.deliveryAvailable)}
                    />
                  )}
                </div>

                {car.pickupLocations?.length ? (
                  <div className="mt-6">
                    <h4 className="mb-3 font-semibold text-foreground">
                      {t('detail.pickup_locations')}
                    </h4>

                    <div className="flex flex-wrap gap-3">
                      {car.pickupLocations.map(
                        (location: string) => (
                          <span
                            key={location}
                            className="rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm text-foreground"
                          >
                            {location}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ) : null}

                {content?.requirements?.length ? (
                  <div className="mt-8">
                    <h4 className="mb-4 font-semibold text-foreground">
                      {t('detail.rental_requirements')}
                    </h4>

                    <div className="grid gap-3 md:grid-cols-2">
                      {content.requirements.map((item) => (
                        <FeatureItem key={item} text={item} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardSection>
            )}

            {isSale && (
              <CardSection title={t('detail.purchase_details')}>
                <div className="space-y-4">
                  {car.pricing.negotiable !== undefined && (
                    <OverviewRow
                      label={t('detail.labels.price_negotiable')}
                      value={formatBoolean(car.pricing.negotiable)}
                    />
                  )}

                  {car.pricing.financingAvailable !== undefined && (
                    <OverviewRow
                      label={t(
                        'detail.labels.financing_available'
                      )}
                      value={formatBoolean(
                        car.pricing.financingAvailable
                      )}
                    />
                  )}

                  {car.pricing.monthlyInstallment && (
                    <OverviewRow
                      label={t(
                        'detail.labels.monthly_installment'
                      )}
                      value={formatPrice(
                        car.pricing.monthlyInstallment
                      )!}
                    />
                  )}

                  {car.ownershipHistory?.owners !== undefined && (
                    <OverviewRow
                      label={t('detail.labels.previous_owners')}
                      value={String(car.ownershipHistory.owners)}
                    />
                  )}

                  {car.ownershipHistory?.accidentFree !==
                    undefined && (
                    <OverviewRow
                      label={t('detail.labels.accident_free')}
                      value={formatBoolean(
                        car.ownershipHistory.accidentFree
                      )}
                    />
                  )}

                  {car.ownershipHistory?.serviceHistory !==
                    undefined && (
                    <OverviewRow
                      label={t('detail.labels.service_history')}
                      value={
                        car.ownershipHistory.serviceHistory
                          ? t('detail.values.available')
                          : t('detail.values.no')
                      }
                    />
                  )}

                  {content?.warranty && (
                    <OverviewRow
                      label={t('detail.labels.warranty')}
                      value={content.warranty}
                    />
                  )}
                </div>
              </CardSection>
            )}
          </div>

          <div className="space-y-8">
            <CardSection
              title={t('detail.booking_purchase_summary')}
            >
              <div className="space-y-5">
                <OverviewRow
                  label={t('detail.labels.availability')}
                  value={
                    car.available
                      ? t('detail.available_now')
                      : t('detail.unavailable')
                  }
                />

                {car.deliveryAvailable !== undefined ? (
                  <OverviewRow
                    label={t('detail.labels.delivery_available')}
                    value={formatBoolean(car.deliveryAvailable)}
                  />
                ) : null}

                {isRental && car.pricing.securityDeposit ? (
                  <OverviewRow
                    label={t('detail.labels.security_deposit')}
                    value={formatPrice(car.pricing.securityDeposit)!}
                  />
                ) : null}

                {isSale &&
                car.pricing.financingAvailable !== undefined ? (
                  <OverviewRow
                    label={t('detail.labels.financing_available')}
                    value={formatBoolean(
                      car.pricing.financingAvailable
                    )}
                  />
                ) : null}

                {isSale && car.pricing.monthlyInstallment ? (
                  <OverviewRow
                    label={t('detail.labels.monthly_installment')}
                    value={formatPrice(
                      car.pricing.monthlyInstallment
                    )!}
                  />
                ) : null}

                {content?.warranty ? (
                  <OverviewRow
                    label={t('detail.labels.warranty')}
                    value={content.warranty}
                  />
                ) : null}

                {car.ownershipHistory?.accidentFree !== undefined ? (
                  <OverviewRow
                    label={t('detail.labels.accident_free')}
                    value={formatBoolean(
                      car.ownershipHistory.accidentFree
                    )}
                  />
                ) : null}

                {car.ownershipHistory?.serviceHistory !==
                undefined ? (
                  <OverviewRow
                    label={t('detail.labels.service_history')}
                    value={
                      car.ownershipHistory.serviceHistory
                        ? t('detail.values.available')
                        : t('detail.values.no')
                    }
                  />
                ) : null}

                {car.fuelConsumption?.combined ? (
                  <OverviewRow
                    label={t('detail.labels.distance_per_20l')}
                    value={t('detail.formats.fuel_range_20l', {
                      value: formatNumber(
                        getFuelRangePer20L(
                          car.fuelConsumption.combined
                        ) ?? undefined
                      )!,
                    })}
                  />
                ) : null}

                {car.electricRange ? (
                  <OverviewRow
                    label={t('detail.labels.electric_range')}
                    value={t('detail.formats.distance', {
                      value: car.electricRange,
                    })}
                  />
                ) : null}
              </div>

              {includedServicesPreview.length ? (
                <div className="mt-8">
                  <h4 className="mb-4 font-semibold text-foreground">
                    {t('detail.included_services')}
                  </h4>
                  <div className="space-y-3">
                    {includedServicesPreview.map((service) => (
                      <FeatureItem key={service} text={service} />
                    ))}
                  </div>
                </div>
              ) : null}
            </CardSection>

            <CardSection title={t('detail.quick_overview')}>
              <div className="space-y-5">
                <OverviewRow
                  label={t('detail.labels.condition')}
                  value={localizedSpecs.condition}
                />
                <OverviewRow
                  label={t('detail.labels.category')}
                  value={localizedSpecs.category}
                />
                <OverviewRow
                  label={t('detail.labels.class')}
                  value={localizedSpecs.class}
                />
                <OverviewRow
                  label={t('detail.labels.color')}
                  value={car.color || '-'}
                />
                <OverviewRow
                  label={t('detail.labels.interior')}
                  value={car.interiorColor || '-'}
                />

                {car.fuelConsumption?.city ? (
                  <OverviewRow
                    label={t('detail.labels.fuel_consumption_city')}
                    value={t('detail.formats.fuel_consumption', {
                      value: car.fuelConsumption.city,
                    })}
                  />
                ) : null}

                {car.fuelConsumption?.highway ? (
                  <OverviewRow
                    label={t(
                      'detail.labels.fuel_consumption_highway'
                    )}
                    value={t('detail.formats.fuel_consumption', {
                      value: car.fuelConsumption.highway,
                    })}
                  />
                ) : null}
              </div>
            </CardSection>

            {content?.comfortFeatures?.length ? (
              <CardSection title={t('detail.comfort_features')}>
                <div className="grid gap-4">
                  {content.comfortFeatures.map((feature) => (
                    <FeatureItem key={feature} text={feature} />
                  ))}
                </div>
              </CardSection>
            ) : null}

            {content?.safetyFeatures?.length ? (
              <CardSection title={t('detail.safety_features')}>
                <div className="grid gap-4 ">
                  {content.safetyFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 rounded-2xl bg-background/60 p-4"
                    >
                      <Shield className="h-5 w-5 text-accent" />
                      <span className="font-medium text-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardSection>
            ) : null}
          </div>
        </div>
      </section>

      {similarCars.length ? (
        <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-foreground">
            {t('detail.similar_vehicles')}
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {similarCars.map(({ car: item, content: itemContent }) => {
              const itemTitle =
                itemContent?.title || getCarTitleFallback(item);

              return (
                <Link
                  key={item.id}
                  href={`/${locale}/fleet/${item.slug}`}
                  className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={item.thumbnail}
                      alt={itemTitle}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      quality={72}
                      placeholder="blur"
                      blurDataURL={getBlurDataURL('#111827', '#1f2937')}
                      className="object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-foreground">
                      {itemTitle}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.city}, {item.country}
                    </p>

                    {itemContent?.shortDescription && (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {itemContent.shortDescription}
                      </p>
                    )}

                    <div className="mt-4 text-lg font-semibold text-accent">
                      {item.pricing.daily
                        ? `${formatPrice(item.pricing.daily)} / ${t('detail.values.day')}`
                        : formatPrice(item.pricing.total)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <div dir='rtl'>
        <ScrollToTopButton />
      </div>
    </div>
  );
}

function CardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
      <h2 className="mb-6 text-3xl font-bold text-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-background/60 p-4">
      <Icon className="h-5 w-5 text-accent" />
      <div>
        <div className="text-xs text-muted-foreground">
          {label}
        </div>
        <div className="font-semibold text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

function OverviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4 last:border-none last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-background/60 p-4">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Check className="h-4 w-4" />
      </div>
      <span className="font-medium text-foreground">{text}</span>
    </div>
  );
}

function OverviewList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl bg-background/60 p-5">
      <h3 className="mb-4 font-semibold text-foreground">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <FeatureItem key={item} text={item} />
        ))}
      </div>
    </div>
  );
}

function PriceBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-background/60 p-4 text-center">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 text-xl font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

function TrustChip({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm text-foreground">
      <Icon className="h-4 w-4 text-accent" />
      <span className="font-medium">{text}</span>
    </div>
  );
}

function SummaryPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}
