interface DataSourceBadgeProps {
  name: string;
  connected: boolean;
  phase: number;
}

export default function DataSourceBadge({ name, connected, phase }: DataSourceBadgeProps) {
  let dotColor: string;
  let statusText: string;

  if (connected) {
    dotColor = 'bg-[#639922]';
    statusText = 'Connected';
  } else if (phase === 2) {
    dotColor = 'bg-gray-400';
    statusText = 'Phase 2';
  } else {
    dotColor = 'bg-[#F8B457]';
    statusText = 'Setting up';
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-medium text-[#434C53]">
      <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
      <span>{name}</span>
      <span className="text-gray-400">&middot;</span>
      <span className="text-gray-500">{statusText}</span>
    </span>
  );
}
