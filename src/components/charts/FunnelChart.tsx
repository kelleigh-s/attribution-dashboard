'use client';

interface FunnelStage {
  stage: string;
  count: number;
  dropOffPercent: number;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  channelName: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function FunnelChart({ stages, channelName }: FunnelChartProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-400 text-sm">No funnel data available</p>
      </div>
    );
  }

  // Filter out stages with 0 count (e.g., Direct has no Impressions/Clicks)
  const activeStages = stages.filter((s) => s.count > 0);

  if (activeStages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-400 text-sm">No funnel data for {channelName}</p>
      </div>
    );
  }

  const maxCount = activeStages[0].count;

  // Teal gradient stops
  const tealGradient = [
    '#006373',
    '#0a7a8a',
    '#1591a1',
    '#20a8b7',
    '#2bbfce',
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#434C53] mb-4">{channelName} Funnel</h3>

      <div className="space-y-2">
        {activeStages.map((stage, index) => {
          const widthPct = Math.max((stage.count / maxCount) * 100, 8); // minimum 8% width for visibility
          const isHighDropOff = stage.dropOffPercent > 70;
          const barColor = isHighDropOff ? '#E24B4A' : tealGradient[Math.min(index, tealGradient.length - 1)];

          return (
            <div key={stage.stage} className="group">
              {/* Stage row */}
              <div className="flex items-center gap-3">
                {/* Label */}
                <div className="w-28 flex-shrink-0 text-right">
                  <span className="text-xs font-medium text-[#434C53]">{stage.stage}</span>
                </div>

                {/* Bar */}
                <div className="flex-1 relative">
                  <div className="h-8 bg-gray-50 rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all duration-500 ease-out flex items-center px-3"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: barColor,
                      }}
                    >
                      <span className="text-xs font-bold text-white whitespace-nowrap">
                        {formatNumber(stage.count)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Drop-off label */}
                <div className="w-24 flex-shrink-0">
                  {stage.dropOffPercent > 0 && (
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: isHighDropOff ? '#E24B4A' : '#9CA3AF' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                      <span
                        className="text-xs font-medium"
                        style={{ color: isHighDropOff ? '#E24B4A' : '#6B7280' }}
                      >
                        -{stage.dropOffPercent.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* High drop-off warning tooltip */}
              {isHighDropOff && (
                <div className="ml-[7.5rem] mt-0.5 pl-3">
                  <p className="text-[10px] text-[#E24B4A] leading-tight">
                    High drop-off: {stage.dropOffPercent.toFixed(1)}% of users leave at this stage. Consider optimizing the {stage.stage.toLowerCase()} experience.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* What this means */}
      <p className="mt-4 text-xs text-gray-400 leading-relaxed">
        Shows how many people drop off at each step from ad view to purchase. Stages in{' '}
        <span className="text-[#E24B4A] font-medium">red</span> have greater than 70% drop-off and may need attention.
      </p>
    </div>
  );
}
