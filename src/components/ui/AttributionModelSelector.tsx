'use client';

import { AttributionModel } from '@/types';
import Tooltip from './Tooltip';

interface AttributionModelSelectorProps {
  value: AttributionModel;
  onChange: (model: AttributionModel) => void;
  phase2Available?: boolean;
}

const models: { label: string; value: AttributionModel; requiresPhase2: boolean }[] = [
  { label: 'Data-driven', value: 'data-driven', requiresPhase2: false },
  { label: 'Last-click', value: 'last-click', requiresPhase2: false },
  { label: 'First-click', value: 'first-click', requiresPhase2: true },
  { label: 'Linear', value: 'linear', requiresPhase2: true },
];

export default function AttributionModelSelector({
  value,
  onChange,
  phase2Available = false,
}: AttributionModelSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden">
      {models.map((model) => {
        const isActive = value === model.value;
        const isDisabled = model.requiresPhase2 && !phase2Available;

        const button = (
          <button
            key={model.value}
            onClick={() => {
              if (!isDisabled) {
                onChange(model.value);
              }
            }}
            disabled={isDisabled}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#006373] text-white'
                : isDisabled
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'text-[#434C53] hover:bg-gray-50'
            }`}
          >
            {model.label}
          </button>
        );

        if (isDisabled) {
          return (
            <Tooltip
              key={model.value}
              content="Requires BigQuery integration — coming soon."
            >
              {button}
            </Tooltip>
          );
        }

        return button;
      })}
    </div>
  );
}
