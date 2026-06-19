'use client';

import { Check, ChevronDown } from 'lucide-react';
import * as Select from '@radix-ui/react-select';

const EMPTY_SELECT_VALUE = '__all__';

export type FilterSelectOption = {
  value: string;
  label: string;
};

type Props = {
  /** Optional visible label rendered above the trigger. Pass undefined to omit. */
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  anyLabel?: string;
  /** Extra class names forwarded to the trigger element */
  triggerClassName?: string;
};

/**
 * Reusable select component used by both HeroSearchBar and CarsFilters.
 *
 * Previously only exported from CarsFilters.tsx, which created a hidden
 * cross-import coupling. This standalone file breaks that dependency.
 *
 * Migration:
 *   // Before
 *   import { FilterSelect } from '../CarsFilters';
 *
 *   // After
 *   import { FilterSelect } from '@/components/filters/FilterSelect';
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  anyLabel = 'Any',
  triggerClassName,
}: Props) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}

      <Select.Root
        value={value || EMPTY_SELECT_VALUE}
        onValueChange={(nextValue) =>
          onChange(nextValue === EMPTY_SELECT_VALUE ? '' : nextValue)
        }
      >
        <Select.Trigger
          className={
            triggerClassName ??
            'flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground backdrop-blur-sm outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20 cursor-pointer'
          }
        >
          <Select.Value placeholder={anyLabel} />
          <Select.Icon>
            <ChevronDown size={12} className="opacity-60" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="z-[120] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg backdrop-blur-xl"
            position="popper"
            side="bottom"
            sideOffset={8}
            collisionPadding={16}
          >
            <Select.Viewport className="p-1">
              <Select.Item
                value={EMPTY_SELECT_VALUE}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground"
              >
                <Select.ItemText>{anyLabel}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <Check size={14} />
                </Select.ItemIndicator>
              </Select.Item>

              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-foreground outline-none hover:bg-accent hover:text-foreground"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2">
                    <Check size={14} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}