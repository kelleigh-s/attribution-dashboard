import { ReactNode } from 'react';
import Tooltip from './Tooltip';

interface KPICardProps {
  label: string;
  value: string;
  change?: number;
  tooltip: string;
  icon?: ReactNode;
}

export default function KPICard({ label, value, change, tooltip, icon }: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#006373]">{icon}</span>}
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <Tooltip content={tooltip} />
      </div>

      {/* Value */}
      <div className="text-[28px] font-semibold text-[#434C53] leading-tight">
        {value}
      </div>

      {/* Change indicator */}
      {change !== undefined && (
        <div className="flex items-center gap-1 text-sm">
          {isPositive && (
            <>
              <svg
                className="w-4 h-4 text-[#639922]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-[#639922] font-medium">+{change}%</span>
            </>
          )}
          {isNegative && (
            <>
              <svg
                className="w-4 h-4 text-[#E24B4A]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-[#E24B4A] font-medium">{change}%</span>
            </>
          )}
          <span className="text-gray-400 text-xs">vs prior period</span>
        </div>
      )}
    </div>
  );
}
