'use client';

import { useState } from 'react';
import DateRangePicker from './ui/DateRangePicker';
import CustomerToggle from './ui/CustomerToggle';
import AttributionModelSelector from './ui/AttributionModelSelector';
import { DateRange, AttributionModel, CustomerFilter } from '@/types';

export default function GlobalControls() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('new');
  const [attributionModel, setAttributionModel] = useState<AttributionModel>('data-driven');

  const lastUpdated = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        <CustomerToggle value={customerFilter} onChange={setCustomerFilter} />
        <AttributionModelSelector
          value={attributionModel}
          onChange={setAttributionModel}
        />

        {/* Data freshness indicator */}
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#639922] animate-pulse" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
