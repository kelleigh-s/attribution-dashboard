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

interface AttributionModelDatum {
  model: string;
  conversions: number;
}

interface AttributionComparisonChartProps {
  data: AttributionModelDatum[];
  channelName: string;
}

const MODEL_COLORS: Record<string, string> = {
  'data-driven': '#006373',
  'last-click': '#023d5b',
  'first-click': '#F8B457',
  linear: '#a0dab3',
};

const MODEL_LABELS: Record<string, string> = {
  'data-driven': 'Data-Driven',
  'last-click': 'Last Click',
  'first-click': 'First Click',
  linear: 'Linear',
};

// Phase 2 models (show as lighter / striped indication)
const PHASE_2_MODELS = new Set(['first-click', 'linear']);

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: AttributionModelDatum }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  const modelKey = entry.payload.model;
  const isPhase2 = PHASE_2_MODELS.has(modelKey);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-[#434C53] mb-1">
        {label}
        {isPhase2 && <span className="ml-1.5 text-[10px] font-normal text-gray-400">(Phase 2 — mock data)</span>}
      </p>
      <p className="text-gray-600">
        Conversions: <span className="font-medium text-[#434C53]">{formatNumber(entry.value)}</span>
      </p>
    </div>
  );
}

// SVG pattern for Phase 2 hatched bars
function HatchPattern({ id, color }: { id: string; color: string }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
      <rect width="6" height="6" fill={color} fillOpacity={0.3} />
      <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="1.5" strokeOpacity={0.6} />
    </pattern>
  );
}

export default function AttributionComparisonChart({ data, channelName }: AttributionComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-400 text-sm">No attribution comparison data available</p>
      </div>
    );
  }

  // Prepare display data with proper labels
  const chartData = data.map((d) => ({
    ...d,
    displayName: MODEL_LABELS[d.model] || d.model,
  }));

  // Find max for interpretation
  const maxEntry = [...data].sort((a, b) => b.conversions - a.conversions)[0];
  const minEntry = [...data].sort((a, b) => a.conversions - b.conversions)[0];
  const maxLabel = MODEL_LABELS[maxEntry.model] || maxEntry.model;
  const minLabel = MODEL_LABELS[minEntry.model] || minEntry.model;
  const diff = maxEntry.conversions - minEntry.conversions;
  const diffPct = minEntry.conversions > 0 ? Math.round((diff / minEntry.conversions) * 100) : 0;

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#434C53] mb-3">
        Attribution Model Comparison — {channelName}
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 8, right: 20, left: 8, bottom: 8 }} barCategoryGap="20%">
          <defs>
            <HatchPattern id="hatch-first-click" color="#F8B457" />
            <HatchPattern id="hatch-linear" color="#a0dab3" />
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="displayName"
            tick={{ fill: '#434C53', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatNumber}
            tick={{ fill: '#434C53', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,99,115,0.04)' }} />

          <Bar dataKey="conversions" radius={[4, 4, 0, 0]} barSize={48}>
            {chartData.map((entry, index) => {
              const isPhase2 = PHASE_2_MODELS.has(entry.model);
              const baseColor = MODEL_COLORS[entry.model] || '#006373';

              if (isPhase2) {
                const patternId = entry.model === 'first-click' ? 'hatch-first-click' : 'hatch-linear';
                return <Cell key={`cell-${index}`} fill={`url(#${patternId})`} />;
              }
              return <Cell key={`cell-${index}`} fill={baseColor} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Phase 2 label */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
        {data.map((d) => {
          const isPhase2 = PHASE_2_MODELS.has(d.model);
          const color = MODEL_COLORS[d.model] || '#006373';
          return (
            <div key={d.model} className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{
                  backgroundColor: isPhase2 ? 'transparent' : color,
                  border: isPhase2 ? `1.5px solid ${color}` : 'none',
                  opacity: isPhase2 ? 0.6 : 1,
                }}
              />
              <span>
                {MODEL_LABELS[d.model] || d.model}
                {isPhase2 && <span className="ml-1 text-[10px] text-gray-400">(Phase 2)</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Plain-English interpretation */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
          {maxLabel} attribution gives {channelName} the most credit ({formatNumber(maxEntry.conversions)} conversions),
          while {minLabel} gives the least ({formatNumber(minEntry.conversions)}).
          {diffPct > 0 && (
            <> That is a {diffPct}% difference, which suggests {channelName} plays a stronger role{' '}
              {maxEntry.model === 'first-click' ? 'at the top of the funnel (discovery)' :
               maxEntry.model === 'last-click' ? 'at the bottom of the funnel (closing)' :
               maxEntry.model === 'data-driven' ? 'across multiple touchpoints' :
               'evenly across the customer journey'}.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
