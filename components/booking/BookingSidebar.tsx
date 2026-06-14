import { BookingState } from "@/data/booking";
import { calcNights } from "@/lib/booking/calcNights";
import { formatDate } from "@/lib/booking/formDate";
import { Calendar, Car, Clock, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";


export function BookingSidebar({ state, carTitle }: { state: BookingState; carTitle: string }) {
  const nights = calcNights(state.dateFrom, state.dateTo);
  const t = useTranslations('booking');

  const items: Array<{ icon: React.ReactNode; label: string; value: string }> = [
    {
      icon: <Car size={14} />,
      label: t('booking_summary.vehicle'),
      value: state.selectedCar ? carTitle : 'Not selected',
    },
    {
      icon: <MapPin size={14} />,
      label: t('booking_summary.pickup'),
      value: state.locationLabel || 'Not selected',
    },
    {
      icon: <Calendar size={14} />,
      label: t('booking_summary.dates'),
      value:
        state.dateFrom && state.dateTo
          ? `${formatDate(state.dateFrom)} → ${formatDate(state.dateTo)}`
          : 'Not selected',
    },
    {
      icon: <Clock size={14} />,
      label: t('booking_summary.time'),
      value: state.pickupTime || '—',
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        
        {/* Car preview */}
        {state.selectedCar && (
          <div className="rounded-2xl overflow-hidden border border-border">
            <div className="relative w-full pb-[55%]">
              <Image
                src={state.selectedCar.thumbnail || state.selectedCar.images[0]}
                alt={carTitle}
                fill
                sizes="300px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-semibold text-sm truncate">
                  {carTitle}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking details */}
        <div className="rounded-2xl overflow-hidden border border-border">
          <div className="px-4 py-3 text-xs font-bold uppercase tracking-widest bg-accent/20 text-accent border-b border-border">
            {t('booking_summary.title')}
          </div>

          {items.map((item) => {
            const hasValue = item.value !== 'Not selected' && item.value !== '—';

            return (
              <div
                key={item.label}
                className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-none"
              >
                <span className={hasValue ? 'text-accent' : 'text-muted-foreground'}>
                  {item.icon}
                </span>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className={`text-xs font-semibold mt-0.5 ${hasValue ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price */}
        {state.selectedCar && nights > 0 && (
          <div className="rounded-2xl p-4 text-center bg-accent/10 border border-accent">
            <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-accent">
              {t('booking_summary.estimated_total')}
            </p>
            <p className="text-3xl font-bold text-accent">
              ${((state.selectedCar.pricing.daily ?? 0) * nights).toLocaleString()}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              {nights} {t('booking_summary.night', { count: nights })} · ${state.selectedCar.pricing.daily}/{t('booking_summary.day')}
            </p>
          </div>
        )}
      </div>
      
    </div>
  );
}