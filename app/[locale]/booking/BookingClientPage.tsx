'use client'

import { BookingSidebar } from "@/components/booking/BookingSidebar";
import { CarTile } from "@/components/booking/CarTile";
import { StepConfirm } from "@/components/booking/StepConfirm";
import { StepDateTime } from "@/components/booking/StepDataTime";
import { StepLocation } from "@/components/booking/StepLocation";
import { Stepper } from "@/components/booking/Stepper"
import { siteConfig } from "@/config";
import { BookingExperienceProps } from "@/data/booking";
import type { Car as CarType } from '@/data/cars';
import { useCarContentMap } from "@/data/cars-content/useCarContent";
import { bookingReducer } from "@/lib/booking/bookingReducer";
import { buildWhatsAppMessage } from "@/lib/booking/buildWhatsAppMessage";
import { initialState } from "@/lib/booking/initialState";
import { prepareCarsForSearch } from "@/lib/search/buildIndex";
import { createSearch } from "@/lib/search/createSearch";
import { searchVehicles } from "@/lib/search/searchVehicles";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";




export function BookingClientPage({
  cars,
  contentMap,
}: BookingExperienceProps) {

  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const t = useTranslations('booking')

  const locale = useLocale();
  const tCar = useTranslations('car');
  const arContentMap = useCarContentMap('ar');
  const enContentMap = useCarContentMap('en');
  const defaultContentMap = useCarContentMap(locale);
  const carContentMap = contentMap || defaultContentMap;
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState(1);
  
  

  // Prepare cars for search with Arabic support
  const preparedCars = useMemo(() => prepareCarsForSearch(cars, arContentMap, enContentMap), [cars, arContentMap, enContentMap]);
  const vehicleSearch = useMemo(() => createSearch(preparedCars), [preparedCars]);
   const STEP_LABELS = [
    t('steps.vehicle'),
    t('steps.location'), 
    t('steps.datetime'),
    t('steps.confirmation')
  ];


  
    // Internationalized constants
    const PICKUP_LOCATIONS = useMemo(() => [
      { value: 'airport', label: t('pickup_locations.airport') },
      { value: 'mezzeh', label: t('pickup_locations.mezzeh') },
      { value: 'hotel', label: t('pickup_locations.hotel') },
      { value: 'custom', label: t('pickup_locations.custom') },
    ], [t]);
  
    const TIME_SLOTS = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00',
    ];
  
  
  
    // Search functionality
    const [searchQuery, setSearchQuery] = useState('');
  
  const carsMap = useMemo(() => {
    return new Map(cars.map(car => [car.id, car]));
  }, [cars]);
  
  const filteredCars = useMemo(() => {
    if (!searchQuery.trim()) return cars;
  
    const results = searchVehicles({
      cars: preparedCars,
      query: searchQuery,
      search: vehicleSearch,
    });
  
    return results
      .map(result => carsMap.get(result.id))
      .filter(Boolean) as CarType[];
  
  }, [searchQuery, preparedCars, vehicleSearch, carsMap, cars]);
  
  const getCarTitle = useCallback((car: CarType | null) => {
    if (!car) return '';
    return (
      carContentMap[car.slug]?.title ||
      `${car.brand.charAt(0).toUpperCase() + car.brand.slice(1)} ${car.model}${car.trim ? ' ' + car.trim : ''} ${car.year}`
    );
  }, [carContentMap]);
  
  const carTitle = getCarTitle(state.selectedCar);
  
  /* Validation per step */
  const canProceed = useMemo(() => {
    if (state.step === 0) return !!state.selectedCar;
    if (state.step === 1) return !!state.location;
    if (state.step === 2) return !!state.dateFrom && !!state.dateTo;
    return true;
  }, [state]);
  
  const { raw: whatsappRaw } = siteConfig.contact.whatsapp;

  const cleanNumber = whatsappRaw.replace(/\D/g, '');

    const handleSubmit = () => {
      const msg = buildWhatsAppMessage(state, carTitle, locale);
      const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    };

    useEffect(() => {
      scrollRef.current?.scrollTo({
        top: 0,
        behavior: 'auto', 
      });
    }, [state.step]);

  
  return (
    <div className="min-h-screen bg-background w-full" dir='ltr'>
      <div className="mx-auto max-w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between w-full">
  
          {/* Left */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] mb-2 text-accent">
              {t('header.subtitle')}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('header.title')}
            </h2>
            <p className="mt-2 text-sm max-w-xl text-muted-foreground">
              {t('header.description')}
            </p>
          </div>

          {/* Right (mobile only) */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted transition"
          >
            {t('booking_summary.title')}
          </button>

        </div>


          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
            <div className="hidden lg:block sticky top-20 h-[calc(100vh-140px)] overflow-hidden rounded-xl border border-border bg-background-secondary p-5">
              <BookingSidebar state={state} carTitle={carTitle} />
            </div>
            <div className="flex flex-col gap-6">

              <div className="block sticky top-0 lg:top-20 h-fit z-20 bg-background/90 backdrop-blur rounded-xl border border-border p-4 transition-all duration-300">
                <Stepper step={state.step} labels={STEP_LABELS} />
              </div>


              <div className="flex-1 min-w-0 flex flex-col h-full mb-5">

                {/* Step title */}
                <div className="px-5 lg:px-8 pt-5 lg:pt-8 shrink-0">
                  <h3 className="text-lg font-bold text-foreground">
                    {state.step === 0 && t('steps.select_vehicle')}
                    {state.step === 1 && t('steps.select_location')}
                    {state.step === 2 && t('steps.select_datetime')}
                    {state.step === 3 && t('steps.review_confirm')}
                  </h3>
                  <p className="text-sm mt-0.5 text-muted-foreground">
                    {state.step === 0 && t('steps.vehicle_description', { count: filteredCars.length, city: 'Damascus' })}
                    {state.step === 1 && t('steps.location_description')}
                    {state.step === 2 && t('steps.datetime_description')}
                    {state.step === 3 && t('steps.confirm_description')}
                  </p>
                </div>

                {/* Steps */}
                <div
                  ref={scrollRef} 
                  className="flex-1 overflow-y-auto px-5 lg:px-8 pb-32"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={state.step}
                      initial={{ opacity: 0, x: direction * 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -40 }}
                      transition={{ duration: 0.25 }}
                    >
                      {state.step === 0 && (
                        <div className="space-y-4">
                          {/* Search input */}
                          <div className="relative mt-3">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder={t('search.placeholder')}
                              className="w-full px-4 py-3.5 text-base rounded-xl border border-border bg-muted text-foreground transition-all"
                            />
                            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                          
                          {/* Vehicle grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCars.map((car) => (
                              <CarTile
                                key={car.id}
                                car={car}
                                selected={state.selectedCar?.id === car.id}
                                onSelect={() => dispatch({ type: 'SELECT_CAR', payload: car })}
                                 title={
                                  carContentMap[car.slug]?.title ||
                                  `${car.brand} ${car.model}`
                                }
                                tCar={tCar}
                                locale={locale}
                              />
                            ))}
                          </div>
                          
                          {filteredCars.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>{t('search.no_results')}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {state.step === 1 && (
                        <StepLocation
                          location={state.location}
                          onSet={(value, label) => dispatch({ type: 'SET_LOCATION', payload: { value, label } })}
                          pickupLocations={PICKUP_LOCATIONS}
                        />
                      )}

                      {state.step === 2 && (
                        <StepDateTime
                          dateFrom={state.dateFrom}
                          dateTo={state.dateTo}
                          pickupTime={state.pickupTime}
                          onDates={(from, to) => dispatch({ type: 'SET_DATES', payload: { dateFrom: from, dateTo: to } })}
                          onTime={(time) => dispatch({ type: 'SET_TIME', payload: time })}
                          timeSlots={TIME_SLOTS}
                        />
                      )}

                      {state.step === 3 && (
                        <StepConfirm
                          state={state}
                          carTitle={carTitle}
                          onSubmit={handleSubmit}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {state.step < 3 && (
                  <div className="sticky bottom-0 left-0 right-0 px-4 pb-4 z-20">
                    <div className="mx-auto w-full max-w-2xl rounded-xl bg-background/80 backdrop-blur border border-border p-3">
                      
                      <div className="flex gap-3">
                        
                        <button
                          onClick={() => {
                            setDirection(-1);
                            dispatch({ type: 'PREV' });
                          }}
                          disabled={state.step === 0}
                          className="flex-1 py-3 flex cursor-pointer items-center justify-center gap-2 text-sm font-bold border text-muted-foreground bg-muted rounded-xl"
                        >
                          <ChevronLeft size={16} /> {t('buttons.back')}
                        </button>

                        <button
                          onClick={() => {
                            setDirection(1);
                            dispatch({ type: 'NEXT' });
                          }}
                          disabled={!canProceed}
                          className={`flex-1 py-3 flex items-center cursor-pointer justify-center gap-2 rounded-xl text-sm font-bold transition-all
                          ${canProceed ? 'bg-accent text-white' : 'bg-muted text-muted-foreground border border-accent'}`}
                        >
                          {state.step === 2 ? t('buttons.review_booking') : t('buttons.continue')}
                          <ArrowRight size={15} />
                        </button>

                      </div>
                    </div>
                  </div>
                 )}
                {state.step === 3 && (
                  <div className="sticky bottom-0 left-0 right-0 px-4 pb-4 z-20">
                    <div className="mx-auto w-full max-w-md">
                        <button
                          onClick={() => dispatch({ type: 'RESET' })}
                          className="text-sm font-bold text-white bg-destructive/80 w-full px-6 py-2.5 rounded-xl shadow-lg
                          cursor-pointer hover:bg-destructive hover:scale-110 transition-all duration-300"
                        >
                          {t('buttons.reset')}
                      </button>
                   </div>
                  </div>
                )}
              </div>
            </div>            
          </div>
        </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] bg-background rounded-t-3xl p-5 overflow-y-auto"
            >
              <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">{t('booking_summary.title')}</h3>
                <button onClick={() => setMobileOpen(false)}>✕</button>
              </div>

              <BookingSidebar state={state} carTitle={carTitle} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}