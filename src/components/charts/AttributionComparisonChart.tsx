'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface AttributionModelDatum {
  model: string;
  label: string;
  conversions: number;
  description: string;
  isDefault: boolean;
}

interface AttributionComparisonChartProps {
  data: AttributionModelDatum[];
  channelName: string;
}

// Palette cycles through BICR brand colors
const BAR_PALETTE = [
  '#006373', // teal (primary)
  '#023d5b', // deep navy
  '#F8B457', // orange
  '#a0dab3', // light green
  '#faa475', // warm orange
  '#db704f', // burnt orange
  '#dba5a1', // dusty pink
  '#b5e2e4', // light teal
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: AttributionModelDatum }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  const d = entry.payload;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm max-w-xs">
      <p className="font-semibold text-[#434C53] mb-1">
        {d.label}
        {d.isDefault && (
          <span className="ml-1.5 text-[10px] font-normal text-[#006373]">(default)</span>
        )}
      </p>
      <p className="text-gray-600 mb-2">
        Conversions:{' '}
        <span className="font-medium text-[#434C53]">{formatNumber(entry.value)}</span>
      </p>
      <p className="text-[11px] text-gray-500 leading-snug">{d.description}</p>
    </div>
  );
}

export default function AttributionComparisonChart({
  data,
  channelName,
}: AttributionComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-400 text-sm">No attribution comparison data available</p>
      </div>
    );
  }

  // Find max and min for interpretation
  const sorted = [...data].sort((a, b) => b.conversions - a.conversions);
  const maxEntry = sorted[0];
  const minEntry = sorted[sorted.length - 1];
  const diff = maxEntry.conversions - minEntry.conversions;
  const diffPct =
    minEntry.conversions > 0 ? Math.round((diff / minEntry.conversions) * 100) : 0;

  // Find default model
  const defaultModel = data.find((d) => d.isDefault);

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#434C53] mb-1">
        Attribution Model Comparison — {channelName}
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        How many conversions {channelName} claims under each of its available attribution models
      </p>

      <ResponsiveContainer width="100%" height={Math.max(280, data.length * 32)}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 20, left: 8, bottom: 8 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#434C53', fontSize: 11 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            interval={0}
            angle={data.length > 5 ? -25 : 0}
            textAnchor={data.length > 5 ? 'end' : 'middle'}
            height={data.length > 5 ? 70 : 30}
          />
          <YAxis
            tickFormatter={formatNumber}
            tick={{ fill: '#434C53', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <RechartsTooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(0,99,115,0.04)' }}
          />

          <Bar dataKey="conversions" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((entry, index) => {
              const color = BAR_PALETTE[index % BAR_PALETTE.length];
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
        {data.map((d, i) => {
          const color = BAR_PALETTE[i % BAR_PALETTE.length];
          return (
            <div key={d.model} className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span>
                {d.label}
                {d.isDefault && (
                  <span className="ml-1 text-[10px] text-[#006373] font-medium">
                    (default)
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Plain-English interpretation */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
          {maxEntry.label} gives {channelName} the most credit (
          {formatNumber(maxEntry.conversions)} conversions), while {minEntry.label} gives the
          least ({formatNumber(minEntry.conversions)}).
          {diffPct > 0 && (
            <>
              {' '}
              That is a {diffPct}% gap — the wider this gap, the more {channelName}&apos;s
              reported performance depends on which model you use.
            </>
          )}
          {defaultModel && (
            <>
              {' '}
              {channelName}&apos;s default setting ({defaultModel.label}) reports{' '}
              {formatNumber(defaultModel.conversions)} conversions.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
