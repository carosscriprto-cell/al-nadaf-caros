'use client';

import * as React from 'react';
import { cn } from './utils';

type SliderProps = React.InputHTMLAttributes<HTMLInputElement> & {
  min: number;
  max: number;
  step?: number;
  value: number;
};

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min, max, step = 1, value, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      className={cn(
        'h-3 w-full cursor-pointer appearance-none rounded-full bg-border/40 accent-accent transition duration-200',
        className
      )}
      {...props}
    />
  )
);

Slider.displayName = 'Slider';
