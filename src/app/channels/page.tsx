'use client';

import { useState, useMemo } from 'react';
import KPICard from '@/components/ui/KPICard';
import Tooltip from '@/components/ui/Tooltip';
import AttributionComparisonChart from '@/components/charts/AttributionComparisonChart';
import {
  CHANNELS,
  mockChannelPerformance,
  mockCampaigns,
} from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function fmtPercent(n: number): string {
  return `${n.toFixed(2)}%`;
}

// ---------------------------------------------------------------------------
// Connected channels only
// ---------------------------------------------------------------------------
const connectedChannels = CHANNELS.filter((ch) => ch.connected);

// ---------------------------------------------------------------------------
// Sort key type
// ---------------------------------------------------------------------------
type SortKey =
  | 'name'
  | 'spend'
  | 'newCustomers'
  | 'roas'
  | 'cpa'
  | 'newCustomerPercent'
  | 'status';

// ---------------------------------------------------------------------------
// PAGE COMPONENT
// ---------------------------------------------------------------------------
export default function ChannelsPage() {
  const [selectedChannelId, setSelectedChannelId] = useState('google-ads');
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortAsc, setSortAsc] = useState(false);

  // Current channel performance
  const channelPerf = mockChannelPerformance.find(
    (ch) => ch.channelId === selectedChannelId
  );

  // All-channel average new customer %
  const avgNewCustomerPct = useMemo(() => {
    const total = mockChannelPerformance.reduce(
      (sum, ch) => sum + ch.newCustomerPercent,
      0
    );
    return total / mockChannelPerformance.length;
  }, []);

  // Attribution model comparison data for selected channel
  const attributionData = useMemo(() => {
    if (!channelPerf) return [];
    const base = channelPerf.conversions;
    return [
      { model: 'data-driven', conversions: base },
      { model: 'last-click', conversions: Math.round(base * 1.1) },
      { model: 'first-click', conversions: Math.round(base * 0.85) },
      { model: 'linear', conversions: Math.round(base * 0.95) },
    ];
  }, [channelPerf]);

  // Campaigns for selected channel
  const campaigns = useMemo(() => {
    const filtered = mockCampaigns.filter(
      (c) => c.channelId === selectedChannelId
    );
    const sorted = [...filtered].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sortKey) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'spend':
          aVal = a.spend;
          bVal = b.spend;
          break;
        case 'newCustomers':
          aVal = a.newCustomers;
          bVal = b.newCustomers;
          break;
        case 'roas':
          aVal = a.roas;
          bVal = b.roas;
          break;
        case 'cpa':
          aVal = a.cpa;
          bVal = b.cpa;
          break;
        case 'newCustomerPercent':
          aVal = a.newCustomerPercent;
          bVal = b.newCustomerPercent;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a.spend;
          bVal = b.spend;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [selectedChannelId, sortKey, sortAsc]);

  // KPI cards for the selected channel
  const kpiCards = channelPerf
    ? [
        {
          label: 'Spend',
          value: fmtCurrency(channelPerf.spend),
          tooltip: 'Total ad spend for this channel during the selected period.',
        },
        {
          label: 'Impressions',
          value: fmtNumber(channelPerf.impressions),
          tooltip:
            'Number of times ads from this channel were shown to users.',
        },
        {
          label: 'Clicks',
          value: fmtNumber(channelPerf.clicks),
          tooltip:
            'Number of times users clicked on an ad from this channel.',
        },
        {
          label: 'CTR (Click-Through Rate)',
          value: fmtPercent(channelPerf.ctr),
          tooltip:
            'Click-Through Rate: the percentage of impressions that resulted in a click. CTR = Clicks / Impressions.',
        },
        {
          label: 'CPC (Cost Per Click)',
          value: fmtCurrency(channelPerf.cpc),
          tooltip:
            'Cost Per Click: how much each click costs on average. CPC = Spend / Clicks.',
        },
        {
          label: 'Sessions',
          value: fmtNumber(channelPerf.sessions),
          tooltip:
            'Number of website sessions attributed to this channel by GA4.',
        },
        {
          label: 'New Customers',
          value: fmtNumber(channelPerf.newCustomers),
          subtitle: `Platform-reported: ${fmtNumber(
            Math.round(
              channelPerf.platformReportedConversions *
                (channelPerf.newCustomerPercent / 100)
            )
          )} vs GA4-attributed: ${fmtNumber(channelPerf.newCustomers)}`,
          tooltip:
            'First-time purchasers attributed to this channel. The platform-reported number is what the ad platform claims; the GA4 number is the independent measurement.',
        },
        {
          label: 'ROAS (Return on Ad Spend)',
          value: channelPerf.spend > 0 ? `${channelPerf.roas.toFixed(2)}x` : 'N/A',
          tooltip:
            'Return on Ad Spend: total revenue divided by total spend. A 4x ROAS means $4 revenue for every $1 spent.',
        },
      ]
    : [];

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return '';
    return sortAsc ? ' \u25B2' : ' \u25BC';
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ----------------------------------------------------------------- */}
      {/* Page Header                                                        */}
      {/* ----------------------------------------------------------------- */}
      <header>
        <h1 className="text-3xl font-bold text-[#434C53] tracking-tight">
          How Each Channel Performs
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Detailed performance by channel
        </p>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Channel Selector Tabs                                              */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <div className="flex flex-wrap gap-2">
          {connectedChannels.map((ch) => {
            const isActive = ch.id === selectedChannelId;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannelId(ch.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#006373] text-white shadow-sm'
                    : 'bg-white text-[#434C53] border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {ch.name}
                {ch.type === 'organic' && (
                  <span className="ml-1.5 text-[10px] opacity-70">(organic)</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Performance Summary Cards                                          */}
      {/* ----------------------------------------------------------------- */}
      {channelPerf && (
        <section>
          <h2 className="text-xl font-semibold text-[#434C53] mb-4">
            Performance Summary — {channelPerf.channelName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi) => (
              <div key={kpi.label}>
                <KPICard
                  label={kpi.label}
                  value={kpi.value}
                  tooltip={kpi.tooltip}
                />
                {'subtitle' in kpi && kpi.subtitle && (
                  <p className="mt-1 px-1 text-[10px] text-gray-400 leading-tight">
                    {kpi.subtitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Attribution Model Comparison                                       */}
      {/* ----------------------------------------------------------------- */}
      {channelPerf && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-[#434C53]">
              Attribution Model Comparison
            </h2>
            <Tooltip content="Shows how many conversions this channel gets credit for under different attribution models. Data-Driven and Last Click use current data; First Click and Linear are Phase 2 estimates." />
          </div>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
            <AttributionComparisonChart
              data={attributionData}
              channelName={channelPerf.channelName}
            />
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* New Customer %                                                     */}
      {/* ----------------------------------------------------------------- */}
      {channelPerf && (
        <section>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-gray-500 mb-2">
                New customer percentage for {channelPerf.channelName}
              </p>
              <div className="text-5xl font-bold text-[#006373]">
                {channelPerf.newCustomerPercent.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                of conversions from this channel are new customers
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-gray-500">All-channel average:</span>
                <span className="font-semibold text-[#434C53]">
                  {avgNewCustomerPct.toFixed(1)}%
                </span>
                {channelPerf.newCustomerPercent > avgNewCustomerPct ? (
                  <span className="text-[#639922] text-xs font-medium">
                    ({(channelPerf.newCustomerPercent - avgNewCustomerPct).toFixed(1)}pp above average)
                  </span>
                ) : (
                  <span className="text-[#E24B4A] text-xs font-medium">
                    ({(avgNewCustomerPct - channelPerf.newCustomerPercent).toFixed(1)}pp below average)
                  </span>
                )}
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
              <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
              A higher new customer percentage means this channel is better at finding people who have
              never bought before. A lower percentage means the channel is primarily reaching existing
              customers (which can still be valuable for retention, but is not growing the customer base).
            </p>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Campaign Breakdown Table                                           */}
      {/* ----------------------------------------------------------------- */}
      {campaigns.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-[#434C53]">
              Campaign Breakdown
            </h2>
            <Tooltip content="Individual campaigns within this channel. Click any column header to sort. Rows flagged in red have a platform overclaim greater than 50%, meaning the ad platform reports more than 1.5x the conversions that GA4 attributes." />
          </div>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th
                    className="text-left px-4 py-3 font-medium text-[#434C53] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Campaign{sortIndicator('name')}
                  </th>
                  <th
                    className="text-right px-4 py-3 font-medium text-[#434C53] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('spend')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Spend{sortIndicator('spend')}
                    </span>
                  </th>
                  <th
                    className="text-right px-4 py-3 font-medium text-[#434C53] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('newCustomers')}
                  >
                    <span className="inline-flex items-center gap-1">
                      New Customers{sortIndicator('newCustomers')}
                    </span>
                  </th>
                  <th
                    className="text-right px-4 py-3 font-medium text-[#434C53] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('roas')}
                  >
                    <span className="inline-flex items-center gap-1">
                      ROAS{sortIndicator('roas')}
                      <Tooltip content="Return on Ad Spend. Revenue divided by spend. Higher is better." />
                    </span>
                  </th>
                  <th
                    className="text-right px-4 py-3 font-medium text-[#434C53] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('cpa')}
                  >
                    <span className="inline-flex items-center gap-1">
                      CPA{sortIndicator('cpa')}
                      <Tooltip content="Cost Per Acquisition. Spend divided by conversions. Lower is better." />
                    </span>
                  </th>
                  <th
                    className="text-right px-4 py-3 font-medium text-[#434C53] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('newCustomerPercent')}
                  >
                    <span className="inline-flex items-center gap-1">
                      New Cust %{sortIndicator('newCustomerPercent')}
                    </span>
                  </th>
                  <th
                    className="text-center px-4 py-3 font-medium text-[#434C53] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    Status{sortIndicator('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const overclaim =
                    campaign.platformReportedConversions > 0 && campaign.conversions > 0
                      ? ((campaign.platformReportedConversions - campaign.conversions) /
                          campaign.conversions) *
                        100
                      : 0;
                  const isHighOverclaim = overclaim > 50;

                  return (
                    <tr
                      key={campaign.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                        isHighOverclaim ? 'bg-red-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-[#434C53] font-medium">
                        <div>{campaign.name}</div>
                        {isHighOverclaim && (
                          <div className="text-[10px] text-[#E24B4A] mt-0.5 flex items-center gap-1">
                            <svg
                              className="w-3 h-3 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Platform overclaim: +{overclaim.toFixed(0)}%
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {fmtCurrency(campaign.spend)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {fmtNumber(campaign.newCustomers)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {campaign.roas.toFixed(2)}x
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {fmtCurrency(campaign.cpa)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {campaign.newCustomerPercent.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            campaign.status === 'active'
                              ? 'bg-[#639922]/15 text-[#639922]'
                              : campaign.status === 'paused'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
            <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
            This table shows each campaign within the selected channel. Click any column header to sort.
            Rows highlighted in red have a platform overclaim greater than 50% — this means the ad platform
            is reporting significantly more conversions than GA4 can verify. Use the GA4 numbers for
            decision-making, not the platform numbers.
          </p>
        </section>
      )}

      {/* No campaigns message for organic channels */}
      {campaigns.length === 0 && channelPerf && (
        <section>
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-8 text-center">
            <p className="text-gray-500 text-sm">
              {channelPerf.channelName} is an organic channel — there are no individual campaigns to
              break down. See the Acquisition page for a full channel comparison.
            </p>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Phase 2 Note                                                       */}
      {/* ----------------------------------------------------------------- */}
      <section className="pb-8">
        <div className="rounded-lg p-5 border border-[#C3E3F2]" style={{ backgroundColor: '#C3E3F2' }}>
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#006373] mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-[#006373] mb-1">
                Coming Soon
              </h3>
              <p className="text-sm text-[#434C53] leading-relaxed">
                Assisted vs. closing analysis and full attribution model comparison across all
                channels. This will show which channels help start the customer journey vs. which ones
                close the sale.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
