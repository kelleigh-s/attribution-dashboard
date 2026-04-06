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
  Legend,
} from 'recharts';

interface ChannelBarDatum {
  name: string;
  value: number;
  platformReported?: number;
  type: 'paid' | 'organic';
}

interface ChannelBarChartProps {
  data: ChannelBarDatum[];
  metric: string;
  showOverclaim?: boolean;
}

const COLORS: Record<string, string> = {
  paid: '#006373',
  organic: '#F8B457',
  paidLight: '#C3E3F2',
  organicLight: '#faa475',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; dataKey: string }[];
  label?: string;
  metric: string;
}

function CustomTooltip({ active, payload, label, metric }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-[#434C53] mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-gray-600">
          {entry.dataKey === 'platformReported' ? 'Platform Reported' : metric}:{' '}
          <span className="font-medium text-[#434C53]">{formatNumber(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function ChannelBarChart({ data, metric, showOverclaim = false }: ChannelBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-400 text-sm">No channel data available</p>
      </div>
    );
  }

  // Sort descending by value
  const sorted = [...data].sort((a, b) => b.value - a.value);

  // Compute overclaim labels
  const overclaims = sorted.map((d) => {
    if (showOverclaim && d.platformReported && d.platformReported > d.value) {
      const pct = Math.round(((d.platformReported - d.value) / d.value) * 100);
      return pct > 50 ? `Platform overclaim: +${pct}%` : null;
    }
    return null;
  });

  const barHeight = 44;
  const chartHeight = Math.max(280, sorted.length * (showOverclaim ? barHeight * 2.2 : barHeight * 1.6) + 60);

  return (
    <div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 8, right: 40, left: 8, bottom: 8 }}
          barCategoryGap="24%"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
          <XAxis
            type="number"
            tickFormatter={formatNumber}
            tick={{ fill: '#434C53', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fill: '#434C53', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <RechartsTooltip content={<CustomTooltip metric={metric} />} cursor={{ fill: 'rgba(0,99,115,0.04)' }} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />

          <Bar dataKey="value" name={metric} radius={[0, 4, 4, 0]} barSize={20}>
            {sorted.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.type]} />
            ))}
          </Bar>

          {showOverclaim && (
            <Bar dataKey="platformReported" name="Platform Reported" radius={[0, 4, 4, 0]} barSize={20} opacity={0.4}>
              {sorted.map((entry, index) => (
                <Cell key={`cell-pr-${index}`} fill={entry.type === 'paid' ? COLORS.paidLight : COLORS.organicLight} />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Overclaim warnings */}
      {showOverclaim && overclaims.some(Boolean) && (
        <div className="mt-2 space-y-1">
          {overclaims.map((label, i) =>
            label ? (
              <p key={i} className="text-xs text-[#E24B4A] font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {sorted[i].name}: {label}
              </p>
            ) : null
          )}
        </div>
      )}

      {/* What this means */}
      <p className="mt-3 text-xs text-gray-400 leading-relaxed">
        Channels ranked by {metric}. <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#006373] align-middle mr-0.5" /> Teal = paid.{' '}
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#F8B457] align-middle mr-0.5" /> Amber = organic.
      </p>
    </div>
  );
}
