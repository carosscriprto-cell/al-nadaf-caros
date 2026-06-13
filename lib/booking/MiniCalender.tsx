import { ChevronLeft, ChevronRight } from "lucide-react";

export function MiniCalendar({
  month,
  year,
  selectedFrom,
  selectedTo,
  onSelect,
  onPrevMonth,
  onNextMonth,
  minDate,
}: {
  month: number;
  year: number;
  selectedFrom: string;
  selectedTo: string;
  onSelect: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  minDate: string;
}) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toISO = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrevMonth}
          className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft size={15} />
        </button>

        <span className="text-sm font-semibold text-foreground">
          {monthNames[month]} {year}
        </span>

        <button
          onClick={onNextMonth}
          className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:bg-muted"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider py-1 text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={i} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const iso = toISO(d);

          const isSelected = iso === selectedFrom || iso === selectedTo;
          const inRange = selectedFrom && selectedTo && iso > selectedFrom && iso < selectedTo;
          const isPast = iso < minDate;

          return (
            <button
              key={d}
              disabled={isPast}
              onClick={() => !isPast && onSelect(iso)}
              className={`text-xs py-1.5 rounded-lg transition-all
                ${isSelected ? 'bg-accent text-white font-bold' : ''}
                ${inRange ? 'bg-accent/10' : ''}
                ${isPast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted'}
              `}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}