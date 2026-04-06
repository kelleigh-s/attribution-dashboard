'use client';

interface FlowChannel {
  name: string;
  newCustomers: number;
  percentTotal: number;
  aov: number;
  type: 'paid' | 'organic';
}

interface ChannelFlowDiagramProps {
  channels: FlowChannel[];
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  paid: { bg: '#006373', border: '#006373', text: '#ffffff' },
  organic: { bg: '#F8B457', border: '#F8B457', text: '#434C53' },
};

function formatCurrency(n: number): string {
  return `$${n.toFixed(0)}`;
}

export default function ChannelFlowDiagram({ channels }: ChannelFlowDiagramProps) {
  if (!channels || channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-400 text-sm">No channel flow data available</p>
      </div>
    );
  }

  // Take top 5 by new customers
  const top5 = [...channels]
    .sort((a, b) => b.newCustomers - a.newCustomers)
    .slice(0, 5);

  const totalCustomers = top5.reduce((sum, ch) => sum + ch.newCustomers, 0);

  return (
    <div>
      <div className="flex items-stretch gap-0 min-h-[320px]">
        {/* Column 1: Channels */}
        <div className="flex-1 flex flex-col gap-3 justify-center pr-2">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold text-center mb-1">
            Channels
          </div>
          {top5.map((ch, i) => {
            const colors = TYPE_COLORS[ch.type];
            return (
              <div
                key={i}
                className="rounded-lg px-3 py-2.5 text-xs shadow-sm border"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <div className="font-semibold text-sm leading-tight">{ch.name}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 opacity-90 text-[11px]">
                  <span>{ch.newCustomers.toLocaleString()} new</span>
                  <span>{ch.percentTotal.toFixed(1)}%</span>
                  <span>AOV {formatCurrency(ch.aov)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connector lines: Channels -> Consideration */}
        <div className="w-16 flex flex-col justify-center relative">
          {top5.map((_, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div className="w-full h-px bg-gray-300" />
            </div>
          ))}
        </div>

        {/* Column 2: Consideration */}
        <div className="w-36 flex flex-col justify-center items-center">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold text-center mb-1">
            Touchpoints
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-6 text-center shadow-sm flex-shrink-0">
            <div className="text-xs text-gray-500 mb-1">Consideration</div>
            <div className="text-2xl font-bold text-[#006373]">
              {totalCustomers.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">visitors engaged</div>
          </div>
        </div>

        {/* Connector lines: Consideration -> Purchase */}
        <div className="w-16 flex items-center justify-center">
          <div className="w-full h-px bg-gray-300 relative">
            {/* Arrow head */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 1l8 5-8 5V1z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Column 3: Purchase */}
        <div className="w-32 flex flex-col justify-center items-center">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold text-center mb-1">
            Purchase
          </div>
          <div className="bg-[#006373] rounded-xl px-4 py-6 text-center shadow-sm">
            <div className="text-xs text-white/70 mb-1">New Customers</div>
            <div className="text-2xl font-bold text-white">
              {totalCustomers.toLocaleString()}
            </div>
            <div className="text-[10px] text-white/60 mt-1">converted</div>
          </div>
        </div>
      </div>

      {/* What this means */}
      <p className="mt-4 text-xs text-gray-400 leading-relaxed">
        Top 5 channels that led to purchases, shown left to right.{' '}
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#006373] align-middle mr-0.5" /> Teal = paid.{' '}
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#F8B457] align-middle mr-0.5" /> Amber = organic.
      </p>
    </div>
  );
}
