import { BookingState } from "@/data/booking";
import { calcNights } from "./calcNights";
import { formatDate } from "./formDate";

export 
function buildWhatsAppMessage(state: BookingState, carTitle: string, locale: string): string {
  const nights = calcNights(state.dateFrom, state.dateTo);
  const totalPrice = state.selectedCar
    ? (state.selectedCar.pricing.daily * nights).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')
    : '—';

  const isArabic = locale === 'ar';
  const messages = isArabic ? {
    title: '🚗 *طلب حجز سيارة*',
    vehicle: `*السيارة:* ${carTitle}`,
    pickup: `*الاستلام:* ${state.locationLabel || '—'}`,
    from: `*من:* ${formatDate(state.dateFrom, locale)} الساعة ${state.pickupTime}`,
    to: `*إلى:* ${formatDate(state.dateTo, locale)}`,
    duration: `*المدة:* ${nights} ${nights !== 1 ? 'ليالي' : 'ليلة'}`,
    total: `*الإجمالي التقديري:* ${totalPrice} ${state.selectedCar?.pricing.currency || 'USD'}`,
    closing: 'يرجى تأكيد التوفر. شكراً لك!'
  } : {
    title: '🚗 *Rental Booking Request*',
    vehicle: `*Vehicle:* ${carTitle}`,
    pickup: `*Pickup:* ${state.locationLabel || '—'}`,
    from: `*From:* ${formatDate(state.dateFrom, locale)} at ${state.pickupTime}`,
    to: `*To:* ${formatDate(state.dateTo, locale)}`,
    duration: `*Duration:* ${nights} night${nights !== 1 ? 's' : ''}`,
    total: `*Est. Total:* ${totalPrice} ${state.selectedCar?.pricing.currency || 'USD'}`,
    closing: 'Please confirm availability. Thank you!'
  };

  return [
    messages.title,
    '',
    messages.vehicle,
    messages.pickup,
    messages.from,
    messages.to,
    messages.duration,
    messages.total,
    '',
    messages.closing,
  ].join('\n');
}