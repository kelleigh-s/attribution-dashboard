'use client';

interface GoalProgressBarProps {
  current: number;
  target: number;
  projected: number;
  label: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  return n.toLocaleString();
}

export default function GoalProgressBar({ current, target, projected, label }: GoalProgressBarProps) {
  if (target <= 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-400 text-sm">No goal data available</p>
      </div>
    );
  }

  const progressPct = Math.min((current / target) * 100, 100);
  const projectedPct = Math.min((projected / target) * 100, 100);
  const gap = target - projected;
  const onTrack = projected >= target;
  const barColor = onTrack ? '#006373' : '#F8B457';
  const statusColor = onTrack ? '#639922' : '#E24B4A';

  return (
    <div>
      {/* Label + status */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[#434C53]">{label}</h3>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: onTrack ? 'rgba(99,153,34,0.1)' : 'rgba(226,75,74,0.1)',
            color: statusColor,
          }}
        >
          {onTrack ? 'On Track' : 'Behind Pace'}
        </span>
      </div>

      {/* Progress bar container */}
      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
        {/* Filled portion */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
          }}
        />

        {/* Progress label inside bar */}
        <div className="absolute inset-0 flex items-center px-3">
          <span
            className="text-xs font-bold"
            style={{ color: progressPct > 15 ? '#fff' : '#434C53' }}
          >
            {progressPct.toFixed(1)}%
          </span>
        </div>

        {/* Projected year-end marker */}
        {projectedPct < 100 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed"
            style={{
              left: `${projectedPct}%`,
              borderColor: '#434C53',
            }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-[#434C53] bg-white px-1 rounded shadow-sm">
              Projected
            </div>
          </div>
        )}

        {/* Target marker at 100% */}
        <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-[#434C53]">
          <div className="absolute -top-5 right-0 whitespace-nowrap text-[10px] font-medium text-[#434C53] bg-white px-1 rounded shadow-sm">
            Target
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
        <span>
          Current: <span className="font-semibold text-[#434C53]">{formatNumber(current)}</span>
        </span>
        <span>
          Target: <span className="font-semibold text-[#434C53]">{formatNumber(target)}</span>
        </span>
        <span>
          Projected: <span className="font-semibold text-[#434C53]">{formatNumber(projected)}</span>
        </span>
        <span>
          Gap:{' '}
          <span className="font-semibold" style={{ color: gap > 0 ? '#E24B4A' : '#639922' }}>
            {gap > 0 ? `-${formatNumber(gap)}` : 'None'}
          </span>
        </span>
      </div>
    </div>
  );
}
