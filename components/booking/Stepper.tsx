import { Step } from "@/data/booking";
import { Check } from "lucide-react";

/** Minimal inline stepper — no external dependencies */
export function Stepper({ step, labels }: { step: Step; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full">
      {labels.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Dot */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300
                  border-2
                  ${done || active ? 'bg-accent text-white border-accent' : 'bg-background text-muted-foreground border-border'}
                `}>
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`hidden sm:block mt-1 text-[10px] font-medium uppercase
                  ${done ? 'text-accent' : active ? 'text-accent' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < labels.length - 1 && (
              <div
                className={`flex-1 h-px mx-2
                  ${done ? 'bg-accent' : 'bg-muted'} transition-colors duration-300`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
