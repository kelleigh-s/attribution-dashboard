'use client';

import { useState, useCallback, useRef } from 'react';
import { getModelsForChannel, type AttributionModelConfig } from '@/lib/channel-attribution';
import { CHANNELS } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CSVUploadProps {
  /** Lock to a specific channel (skip channel selection) */
  channelId?: string;
  /** Called when a valid upload is completed */
  onUpload?: (result: UploadResult) => void;
  /** Compact mode — just the dropzone + minimal fields */
  compact?: boolean;
}

export interface UploadResult {
  channelId: string;
  channelName: string;
  dateStart: string;
  dateEnd: string;
  attributionModel: string;
  headers: string[];
  rows: string[][];
  columnMapping: Record<string, string>;
}

// Standard dashboard fields that uploaded data must map to
const REQUIRED_FIELDS = [
  { key: 'campaign', label: 'Campaign Name', description: 'Name of the campaign or ad set' },
  { key: 'spend', label: 'Spend', description: 'Amount spent in dollars' },
  { key: 'impressions', label: 'Impressions', description: 'Number of times ads were shown' },
  { key: 'clicks', label: 'Clicks', description: 'Number of clicks on ads' },
  { key: 'conversions', label: 'Conversions', description: 'Platform-reported conversions' },
  { key: 'revenue', label: 'Revenue', description: 'Revenue attributed by the platform' },
];

const OPTIONAL_FIELDS = [
  { key: 'cpc', label: 'CPC', description: 'Cost per click (calculated if missing)' },
  { key: 'ctr', label: 'CTR', description: 'Click-through rate (calculated if missing)' },
  { key: 'roas', label: 'ROAS', description: 'Return on ad spend (calculated if missing)' },
  { key: 'newCustomers', label: 'New Customers', description: 'First-time purchasers if tracked' },
  { key: 'reach', label: 'Reach', description: 'Unique users reached' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CSVUpload({ channelId, onUpload, compact = false }: CSVUploadProps) {
  // Step tracking: 1=file, 2=metadata, 3=column mapping, 4=preview
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File data
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);

  // Metadata
  const [selectedChannel, setSelectedChannel] = useState(channelId || '');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  // Column mapping
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Available models for selected channel
  const channelModels: AttributionModelConfig[] = selectedChannel
    ? getModelsForChannel(selectedChannel)
    : [];

  // Parse CSV text
  const parseCSV = useCallback((text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;

    const headerRow = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const dataRows = lines.slice(1).map((line) =>
      line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''))
    );

    setHeaders(headerRow);
    setRows(dataRows);

    // Auto-detect column mappings by common header names
    const autoMap: Record<string, string> = {};
    const headerLower = headerRow.map((h) => h.toLowerCase());

    REQUIRED_FIELDS.concat(OPTIONAL_FIELDS).forEach((field) => {
      const matches: Record<string, string[]> = {
        campaign: ['campaign', 'campaign name', 'ad set', 'ad set name', 'ad group'],
        spend: ['spend', 'cost', 'amount spent', 'total spend'],
        impressions: ['impressions', 'impr', 'impr.'],
        clicks: ['clicks', 'link clicks'],
        conversions: ['conversions', 'results', 'purchases', 'total conversions'],
        revenue: ['revenue', 'conv. value', 'conversion value', 'purchase value', 'purchase roas'],
        cpc: ['cpc', 'cost per click', 'avg. cpc'],
        ctr: ['ctr', 'click-through rate'],
        roas: ['roas', 'return on ad spend'],
        newCustomers: ['new customers', 'first-time buyers', 'new buyers'],
        reach: ['reach', 'unique reach'],
      };

      const possibleNames = matches[field.key] || [];
      const matchIdx = headerLower.findIndex((h) => possibleNames.includes(h));
      if (matchIdx >= 0) {
        autoMap[field.key] = headerRow[matchIdx];
      }
    });

    setMapping(autoMap);
  }, []);

  // Handle file selection
  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.tsv')) {
        alert('Please upload a CSV or TSV file.');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCSV(text);
        setStep(2);
      };
      reader.readAsText(file);
    },
    [parseCSV]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Validate metadata and proceed
  const canProceedToMapping = selectedChannel && dateStart && dateEnd && selectedModel;

  const handleConfirmUpload = () => {
    const channelName =
      CHANNELS.find((ch) => ch.id === selectedChannel)?.name || selectedChannel;
    const result: UploadResult = {
      channelId: selectedChannel,
      channelName,
      dateStart,
      dateEnd,
      attributionModel: selectedModel,
      headers,
      rows,
      columnMapping: mapping,
    };
    onUpload?.(result);
    setStep(4);
  };

  // Available channels for dropdown
  const allChannels = CHANNELS;

  return (
    <div className={compact ? '' : 'space-y-6'}>
      {/* ----------------------------------------------------------------- */}
      {/* Step 1: File Upload                                                */}
      {/* ----------------------------------------------------------------- */}
      {step === 1 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-[#006373] bg-[#006373]/5'
              : 'border-gray-300 hover:border-[#006373]/50 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv"
            onChange={handleInputChange}
            className="hidden"
          />
          <svg
            className="w-10 h-10 text-gray-400 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm font-medium text-[#434C53]">
            Drop a CSV file here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Export data from your ad platform and upload it here
          </p>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Step 2: Metadata (Channel, Date Range, Attribution Model)          */}
      {/* ----------------------------------------------------------------- */}
      {step === 2 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#434C53]">Describe this data</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
              {fileName} ({rows.length} rows)
            </span>
          </div>

          {/* Channel selection (skip if locked) */}
          {!channelId && (
            <div>
              <label className="block text-xs font-medium text-[#434C53] mb-1">
                Channel <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => {
                  setSelectedChannel(e.target.value);
                  setSelectedModel('');
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#434C53] focus:outline-none focus:ring-2 focus:ring-[#006373]/30"
              >
                <option value="">Select a channel...</option>
                {allChannels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#434C53] mb-1">
                Start Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#434C53] focus:outline-none focus:ring-2 focus:ring-[#006373]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#434C53] mb-1">
                End Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#434C53] focus:outline-none focus:ring-2 focus:ring-[#006373]/30"
              />
            </div>
          </div>

          {/* Attribution model (channel-specific options) */}
          {selectedChannel && (
            <div>
              <label className="block text-xs font-medium text-[#434C53] mb-1">
                Attribution Model Used <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#434C53] focus:outline-none focus:ring-2 focus:ring-[#006373]/30"
              >
                <option value="">Select the model this export used...</option>
                {channelModels.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                    {m.isDefault ? ' (platform default)' : ''}
                  </option>
                ))}
              </select>
              {selectedModel && (
                <p className="text-[11px] text-gray-400 mt-1">
                  {channelModels.find((m) => m.key === selectedModel)?.description}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={() => {
                setStep(1);
                setFileName('');
                setHeaders([]);
                setRows([]);
              }}
              className="text-sm text-gray-500 hover:text-[#434C53]"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedToMapping}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                canProceedToMapping
                  ? 'bg-[#006373] text-white hover:bg-[#006373]/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next: Map Columns
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Step 3: Column Mapping                                             */}
      {/* ----------------------------------------------------------------- */}
      {step === 3 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-[#434C53]">Map your columns</h3>
            <p className="text-xs text-gray-400 mt-1">
              Match your spreadsheet columns to dashboard fields. We auto-detected some matches.
            </p>
          </div>

          {/* Required fields */}
          <div>
            <p className="text-xs font-medium text-[#434C53] mb-2">Required</p>
            <div className="space-y-2">
              {REQUIRED_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className="w-36 text-xs text-[#434C53] font-medium flex-shrink-0">
                    {field.label}
                  </div>
                  <select
                    value={mapping[field.key] || ''}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#434C53] focus:outline-none focus:ring-2 focus:ring-[#006373]/30"
                  >
                    <option value="">-- Select column --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  {mapping[field.key] && (
                    <span className="text-[#639922] text-xs flex-shrink-0">Mapped</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Optional fields */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">
              Optional (calculated automatically if missing)
            </p>
            <div className="space-y-2">
              {OPTIONAL_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className="w-36 text-xs text-gray-400 flex-shrink-0">{field.label}</div>
                  <select
                    value={mapping[field.key] || ''}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#006373]/30"
                  >
                    <option value="">-- Not mapped --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview first 3 rows */}
          <div>
            <p className="text-xs font-medium text-[#434C53] mb-2">
              Preview (first 3 rows)
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-[#434C53]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-gray-600">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="text-sm text-gray-500 hover:text-[#434C53]"
            >
              Back
            </button>
            <button
              onClick={handleConfirmUpload}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#006373] text-white hover:bg-[#006373]/90 transition-colors"
            >
              Confirm Upload
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Step 4: Success                                                    */}
      {/* ----------------------------------------------------------------- */}
      {step === 4 && (
        <div className="bg-[#a0dab3]/20 rounded-lg border border-[#a0dab3] p-6 text-center">
          <svg
            className="w-10 h-10 text-[#639922] mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-semibold text-[#434C53]">
            Data uploaded successfully
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {rows.length} rows from {fileName} have been imported.
          </p>
          <button
            onClick={() => {
              setStep(1);
              setFileName('');
              setHeaders([]);
              setRows([]);
              setSelectedModel('');
              setDateStart('');
              setDateEnd('');
              setMapping({});
            }}
            className="mt-3 text-sm text-[#006373] hover:underline"
          >
            Upload another file
          </button>
        </div>
      )}
    </div>
  );
}
