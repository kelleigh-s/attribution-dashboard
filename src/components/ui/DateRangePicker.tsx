'use client';

import { DateRange } from '@/types';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets: { label: string; value: DateRange }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: 'Custom', value: 'custom' },
];

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden">
      {presets.map((preset) => {
        const isActive = value === preset.value;
        return (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#006373] text-white'
                : 'text-[#434C53] hover:bg-gray-50'
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
