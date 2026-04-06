'use client';

import { CustomerFilter } from '@/types';

interface CustomerToggleProps {
  value: CustomerFilter;
  onChange: (filter: CustomerFilter) => void;
}

const options: { label: string; value: CustomerFilter }[] = [
  { label: 'All Customers', value: 'all' },
  { label: 'New Customers Only', value: 'new' },
];

export default function CustomerToggle({ value, onChange }: CustomerToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#006373] text-white'
                : 'text-[#434C53] hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
