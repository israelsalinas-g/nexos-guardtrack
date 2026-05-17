'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const DAYS = [
  { label: 'L', value: 1, full: 'Lunes' },
  { label: 'M', value: 2, full: 'Martes' },
  { label: 'X', value: 3, full: 'Miércoles' },
  { label: 'J', value: 4, full: 'Jueves' },
  { label: 'V', value: 5, full: 'Viernes' },
  { label: 'S', value: 6, full: 'Sábado' },
  { label: 'D', value: 7, full: 'Domingo' },
];

interface DaySelectorProps {
  defaultValue?: number[];
  name?: string;
}

export function DaySelector({ defaultValue = [], name = 'dias_semana' }: DaySelectorProps) {
  const [selected, setSelected] = useState<number[]>(defaultValue);

  const toggle = (value: number) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {DAYS.map((day) => {
          const isSelected = selected.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              title={day.full}
              onClick={() => toggle(day.value)}
              className={cn(
                'w-9 h-9 rounded-lg text-xs font-semibold transition-all active:scale-95',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {day.label}
            </button>
          );
        })}
      </div>
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
    </div>
  );
}
