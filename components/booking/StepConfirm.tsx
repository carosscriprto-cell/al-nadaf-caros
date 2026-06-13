import { BookingState } from "@/data/booking";
import { calcNights } from "@/lib/booking/calcNights";
import { formatDate } from "@/lib/booking/formDate";
import { Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { CarSummaryCard } from "./CarSummaryCard";
import { useTranslations } from "next-intl";

export function StepConfirm({
  state,
  carTitle,
  onSubmit,
}: {
  state: BookingState;
  carTitle: string;
  onSubmit: () => void;
}) {
  const nights = calcNights(state.dateFrom, state.dateTo);
  const total = state.selectedCar ? state.selectedCar.pricing.daily * nights : 0;
  const deposit = state.selectedCar ? state.selectedCar.pricing.securityDeposit : 0;
  const t = useTranslations('booking');
  const rows = [
    { label: t('pickup_location'), value: state.locationLabel || '—', icon: <MapPin size={14} /> },
    { label: t('pickup_date'), value: `${formatDate(state.dateFrom)} at ${state.pickupTime}`, icon: <Calendar size={14} /> },
    { label: t('return_date'), value: formatDate(state.dateTo), icon: <Calendar size={14} /> },
    { label: t('duration'), value: `${nights} ${t('booking_summary.night', { count: nights })}`, icon: <Clock size={14} /> },
  ];

  return (
    <div className="space-y-4 mt-3">
      {/* Car */}
      {state.selectedCar && (
        <CarSummaryCard car={state.selectedCar} title={carTitle} />
      )}

      {/* Details */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1.5px solid var(--color-border-tertiary)' }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            className="flex items-center gap-3 px-4 py-3"
            style={{
              borderBottom: i < rows.length - 1 ? '1px solid var(--color-border-tertiary)' : 'none',
              background: 'var(--color-background-primary)',
            }}
          >
            <span className='text-accent'>{row.icon}</span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)', minWidth: 110 }}>
              {row.label}
            </span>
            <span className="text-sm font-semibold ml-auto text-right" style={{ color: 'var(--color-text-primary)' }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Pricing breakdown */}
      {state.selectedCar && nights > 0 && (
        <div
          className="rounded-2xl p-4 space-y-2 bg-accent/20 border border-accent"
        >
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              ${state.selectedCar.pricing.daily} × {nights} nights
            </span>
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              ${total.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--color-text-tertiary)' }}>{t('booking_summary.security_deposit')}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>${deposit.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 flex justify-between border-accent">
            <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('booking_summary.estimated_total')}</span>
            <span className="text-base font-bold text-accent" >${total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onSubmit}
        className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold transition-all duration-200 active:scale-[0.98]"
        style={{
          background: '#25D366',
          color: '#fff',
          boxShadow: '0 4px 24px rgba(37,211,102,0.3)',
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.06)')}
        onMouseLeave={e => (e.currentTarget.style.filter = '')}
      >
        {t('buttons.whatsapp_button')}
        <Image
          src="/WhatsApp.png"
          alt="WhatsApp"
          width={20}
          height={20}
          style={{ borderRadius: 4 }}
        />
      </button>

      <p className="text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        {t('finalize_message')}
      </p>
    </div>
  );
}