'use client';

import { useState } from 'react';

export interface ChannelSourceInfo {
  channelId: string;
  channelName: string;
  source: 'live' | 'mock';
  lastUpdated: string;
}

interface DataSourceStatusProps {
  sources: ChannelSourceInfo[];
  loading?: boolean;
}

export default function DataSourceStatus({
  sources,
  loading,
}: DataSourceStatusProps) {
  const [expanded, setExpanded] = useState(false);

  const liveCount = sources.filter((s) => s.source === 'live').length;
  const mockCount = sources.filter((s) => s.source === 'mock').length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#434C53]">
            Data Sources
          </span>
          <div className="flex items-center gap-2">
            {liveCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#639922] bg-green-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#639922]" />
                {liveCount} live
              </span>
            )}
            {mockCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#b58a1b] bg-amber-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F8B457]" />
                {mockCount} estimated
              </span>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
            {sources.map((s) => {
              const isLive = s.source === 'live';
              return (
                <div
                  key={s.channelId}
                  className="flex items-center gap-2 text-xs text-[#434C53]"
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isLive ? 'bg-[#639922]' : 'bg-[#F8B457]'
                    }`}
                  />
                  <span className="font-medium">{s.channelName}</span>
                  <span className="text-gray-400">
                    {isLive ? 'Live' : 'Mock'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
            <strong className="text-gray-500">Live</strong> = real-time data
            from platform API.{' '}
            <strong className="text-gray-500">Mock</strong> = placeholder
            estimates (not real).
            {mockCount > 0 &&
              ' Connect remaining APIs to replace mock data with actuals.'}
          </p>
        </div>
      )}
    </div>
  );
}
