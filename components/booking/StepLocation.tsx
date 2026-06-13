import * as RadioGroup from '@radix-ui/react-radio-group';
import { Check, MapPin } from 'lucide-react';



export function StepLocation({
  location,
  onSet,
  pickupLocations,
}: {
  location: string;
  onSet: (value: string, label: string) => void;
  pickupLocations: Array<{ value: string; label: string }>;
}) {


  return (
    <div className="space-y-5">
      <RadioGroup.Root
        value={location}
        onValueChange={(val : string) => {
          const loc = pickupLocations.find((l) => l.value === val);
          if (loc) onSet(loc.value, loc.label);
        }}
        className="grid gap-2 sm:grid-cols-2 mt-3"
      >
        {pickupLocations.map((loc) => (
          <RadioGroup.Item
            key={loc.value}
            value={loc.value}
            asChild
          >
            <button
              className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 focus:outline-none
                ${location === loc.value ? 'border-accent bg-accent/80' : 'border-border bg-background'} border-2`}
            >
              <div
                className={`flex items-center justify-center rounded-full shrink-0 w-28 h-28
                  ${location === loc.value ? 'bg-accent border-accent' : 'bg-background border-foreground/50'} border-2 transition-all duration-200`}
              >
                {location === loc.value
                  ? <Check size={13} className='text-background' />
                  : <MapPin size={13} className='text-accent' />}
              </div>
              <span className="text-sm font-medium text-foreground">
                {loc.label}
              </span>
            </button>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
}