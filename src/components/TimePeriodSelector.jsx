import React from 'react';
import { Clock, CalendarDays, Globe } from 'lucide-react';

const OPTIONS = [
  { label: 'Last 24 Hours', value: 'day', icon: Clock },
  { label: 'Last 3 Days', value: '3days', icon: CalendarDays },
  { label: 'Last Week', value: 'week', icon: CalendarDays },
  { label: 'Last Month', value: 'month', icon: CalendarDays },
  { label: 'Last Year', value: 'year', icon: CalendarDays },
  { label: 'All Time', value: 'all', icon: Globe },
];

function mapCustomToRedditT(value) {
  // Reddit supports only hour, day, week, month, year, all
  if (value === '3days') return 'week';
  if (value === 'day') return 'day';
  return value;
}

export default function TimePeriodSelector({ onSelect }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="time-period-title"
      className="fixed inset-0 bg-background bg-opacity-95 flex flex-col items-center justify-center p-4 z-50"
    >
      <h2
        id="time-period-title"
        className="text-3xl font-bold text-textPrimary mb-8 select-none"
      >
        ⏰ Select Time Period
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-xl w-full">
        {OPTIONS.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onSelect(mapCustomToRedditT(value))}
            className="flex flex-col items-center justify-center rounded-lg bg-card p-6 hover:bg-camoGreen focus:bg-camoGreen focus:outline-none focus:ring-4 focus:ring-camoGreen transition-colors select-none"
            aria-label={`Select time period: ${label}`}
            type="button"
          >
            <Icon size={40} className="mb-3 text-camoGreen" aria-hidden="true" />
            <span className="text-lg font-semibold text-textPrimary">{label}</span>
          </button>
        ))}
      </div>
      <p className="mt-8 text-textMuted max-w-sm text-center select-none">
        Posts will be loaded from r/bapeheads within the selected time frame.
      </p>
    </div>
  );
}
