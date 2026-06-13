import { calcNights } from "@/lib/booking/calcNights";
import { formatDate } from "@/lib/booking/formDate";
import { MiniCalendar } from "@/lib/booking/MiniCalender";
import { useTranslations } from "next-intl";
import { useState } from "react";


export function StepDateTime({
  dateFrom,
  dateTo,
  pickupTime,
  onDates,
  onTime,
  timeSlots,
}: {
  dateFrom: string;
  dateTo: string;
  pickupTime: string;
  onDates: (from: string, to: string) => void;
  onTime: (time: string) => void;
  timeSlots: string[];
}) {
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectingFrom, setSelectingFrom] = useState(true);

  const nights = calcNights(dateFrom, dateTo);
  const t = useTranslations('booking');

  const handleDaySelect = (iso: string) => {
    if (selectingFrom || !dateFrom) {
      onDates(iso, '');
      setSelectingFrom(false);
    } else {
      if (iso <= dateFrom) {
        onDates(iso, '');
        setSelectingFrom(false);
      } else {
        onDates(dateFrom, iso);
        setSelectingFrom(true);
      }
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  return (
    <div className="space-y-5">
      {/* Date range header */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <button
          onClick={() => setSelectingFrom(true)}
          className={`rounded-xl p-3 text-left transition-all
            ${selectingFrom ? 'border-accent bg-accent/80 text-white' : 'border-border bg-background text-accent'} border-2`}
        >
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-1">
            {t('pickup_date')}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {dateFrom ? formatDate(dateFrom) : 'Select date'}
          </p>
        </button>
        <button
          onClick={() => setSelectingFrom(false)}
          className={`rounded-xl p-3 text-left transition-all
            ${!selectingFrom ? 'border-accent bg-accent/80 text-white' : 'border-border bg-background text-accent'} border-2`}
        >
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-1">
            Return
          </p>
          <p className="text-sm font-semibold text-foreground">
            {dateTo ? formatDate(dateTo) : 'Select date'}
          </p>
        </button>
      </div>

      {/* Duration badge */}
      {nights > 0 && (
        <div
          className={`text-center text-sm font-semibold rounded-xl py-2 bg-accent/20 tect-accent `}
        >
          {nights} {t('booking_summary.night', { count: nights })}
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-2xl p-4 bg-muted border border-border">
        <MiniCalendar
          month={calMonth}
          year={calYear}
          selectedFrom={dateFrom}
          selectedTo={dateTo}
          onSelect={handleDaySelect}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          minDate={todayISO}
        />
      </div>

      {/* Time picker */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">
          {t('pickup_time')}
        </p>
        <div className="flex flex-wrap gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => onTime(slot)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150
                ${pickupTime === slot ? 'bg-accent text-white border-accent' : 'bg-background text-foreground border-border'} border-2`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}