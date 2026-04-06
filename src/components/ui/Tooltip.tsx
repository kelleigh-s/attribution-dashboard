'use client';

import { useState, useRef, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children ?? (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-semibold cursor-help select-none">
          ?
        </span>
      )}

      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-[#434C53] text-white text-xs rounded-md px-3 py-2 max-w-[220px] leading-relaxed shadow-lg whitespace-normal">
            {content}
          </div>
          <div className="w-2 h-2 bg-[#434C53] rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  );
}
