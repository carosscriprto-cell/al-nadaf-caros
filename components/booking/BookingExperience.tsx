'use client';

import {
  useCallback,
  useMemo,
  useReducer,
  useState,
} from 'react';
import {
  ArrowRight,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Car as CarType } from '@/types/vehicles';
import { prepareCarsForSearch } from '@/lib/search/buildIndex';
import { createSearch } from '@/lib/search/createSearch';
import { searchVehicles } from '@/lib/search/searchVehicles';
import { siteConfig } from '@/config';
import { StepLocation } from './StepLocation';
import { StepDateTime } from './StepDataTime';
import { buildWhatsAppMessage } from '@/lib/booking/buildWhatsAppMessage';
import { BookingExperienceProps} from '@/data/booking';
import { BookingSidebar } from './BookingSidebar';
import { StepConfirm } from './StepConfirm';
import { CarTile } from './CarTile';
import { Stepper } from './Stepper';
import { bookingReducer } from '@/lib/booking/bookingReducer';
import { initialState } from '@/lib/booking/initialState';


export default function BookingExperience({
  cars,
  contentMap,
  contentAr = {},
  contentEn = {},
  whatsappNumber = siteConfig.contact.whatsapp,
}: BookingExperienceProps) {
  const locale = useLocale();
  const t = useTranslations('booking');
  const tCar = useTranslations('car');
  const arContentMap = contentAr;
  const enContentMap = contentEn;
  const carContentMap = useMemo(() => contentMap ?? {}, [contentMap]);
  
  // Prepare cars for search with Arabic support
  const preparedCars = useMemo(() => prepareCarsForSearch(cars, arContentMap, enContentMap), [cars, arContentMap, enContentMap]);
  const vehicleSearch = useMemo(() => createSearch(preparedCars), [preparedCars]);

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

  const STEP_LABELS = [
    t('steps.vehicle'),
    t('steps.location'), 
    t('steps.datetime'),
    t('steps.confirmation')
  ];

  const [state, dispatch] = useReducer(bookingReducer, initialState);

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

  const handleSubmit = () => {
    const msg = buildWhatsAppMessage(state, carTitle, locale);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section
      id="booking"
      className="w-full h-full"
    >
      {/* Main card */}
      <div
        className="rounded-3xl overflow-hidden mx-auto max-w-[1200px] w-full border border-border  bg-background shadow-lg"
      >
        {/* Stepper bar */}
        <div className="px-6 py-4 bg-accent/20 border-b border-border max-h-[100vh]">
          <Stepper step={state.step} labels={STEP_LABELS} />
        </div>

        {/* Body — split layout */}
        <div className="flex flex-col lg:flex-row min-h-0">
          {/* Left: form content */}
          <div className="flex-1 min-w-0 p-5 lg:p-8 flex flex-col">

            {/* Step title */}
            <div className="mb-5 shrink-0">
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
            <div className="flex-1 overflow-y-auto min-h-100 max-h-[70%]">
              {state.step === 0 && (
                <div className="space-y-4">
                  {/* Search input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('search.placeholder')}
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-muted text-foreground transition-all"
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
                        title={getCarTitle(car)}
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
            </div>

            {/* Navigation buttons */}
            {state.step < 3 && (
              <div className="sticky bottom-0 bg-background/80 backdrop-blur border-t border-border p-4 flex justify-between">
                <button
                  onClick={() => dispatch({ type: 'PREV' })}
                  disabled={state.step === 0}
                >
                  <ChevronLeft size={16} /> Back
                </button>

                <button
                  onClick={() => dispatch({ type: 'NEXT' })}
                  disabled={!canProceed}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 
                    ${canProceed ? 'bg-accent text-white border-accent ring-accent-ring' : 'bg-muted text-muted-foreground border-muted'}`}
                >
                  {state.step === 2 ? 'Review Booking' : 'Continue'}
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Right: sticky summary sidebar (desktop only) */}
          <div
            className="hidden lg:block shrink-0 p-6 overflow-y-auto"
            style={{
              width: 300,
              borderLeft: '1px solid var(--color-border-tertiary)',
              background: 'var(--color-background-secondary)',
              maxHeight: 'calc(100vh - 280px)',
            }}
          >
            <BookingSidebar state={state} carTitle={carTitle} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-px bg-border">
          <div
            className="h-full bg-accent transition-all duration-300 ease-out"
            style={{
              width: `${((state.step) / 3) * 100}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}