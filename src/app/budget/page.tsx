'use client';

import { useState, useMemo } from 'react';
import DonutChart from '@/components/charts/DonutChart';
import Tooltip from '@/components/ui/Tooltip';
import {
  mockChannelPerformance,
  mockEfficiency,
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

// ---------------------------------------------------------------------------
// Paid channels only
// ---------------------------------------------------------------------------
const paidChannels = mockChannelPerformance.filter(
  (ch) => ch.channelType === 'paid'
);

const totalPaidSpend = paidChannels.reduce((s, ch) => s + ch.spend, 0);
const totalPaidNewCustomers = paidChannels.reduce(
  (s, ch) => s + ch.newCustomers,
  0
);
const totalPaidRevenue = paidChannels.reduce((s, ch) => s + ch.revenue, 0);

// Donut data: Spend by channel
const spendDonutColors = ['#006373', '#023d5b', '#b5e2e4'];
const spendDonutData = paidChannels.map((ch, i) => ({
  name: ch.channelName,
  value: ch.spend,
  color: spendDonutColors[i % spendDonutColors.length],
}));

// Donut data: New customers by channel
const customerDonutColors = ['#F8B457', '#faa475', '#db704f'];
const customerDonutData = paidChannels.map((ch, i) => ({
  name: ch.channelName,
  value: ch.newCustomers,
  color: customerDonutColors[i % customerDonutColors.length],
}));

// Find biggest gap between spend share and new customer share
const channelGaps = paidChannels.map((ch) => {
  const spendShare = (ch.spend / totalPaidSpend) * 100;
  const customerShare = (ch.newCustomers / totalPaidNewCustomers) * 100;
  return {
    name: ch.channelName,
    spendShare,
    customerShare,
    gap: spendShare - customerShare,
  };
});
const biggestGap = [...channelGaps].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))[0];

// Efficiency row color
function rankColor(rank: 'top' | 'mid' | 'bottom'): string {
  switch (rank) {
    case 'top':
      return 'bg-[#639922]/10';
    case 'mid':
      return 'bg-[#F8B457]/10';
    case 'bottom':
      return 'bg-[#E24B4A]/10';
  }
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------
const recommendations = [
  {
    title: 'Amplify Organic Search',
    body: 'Organic search drives the most new customers at zero cost. Is there an SEO investment that could amplify this further?',
    color: '#639922',
  },
  {
    title: 'Scale Microsoft Ads',
    body: 'Microsoft Ads shows the lowest CPA (Cost Per Acquisition) among paid channels at $20.95. Would increasing Microsoft budget by 25% be worth testing?',
    color: '#006373',
  },
  {
    title: 'Evaluate Meta ROI',
    body: "Meta's cost per new customer ($58.77) is roughly 2.4x higher than Google Ads. Is the brand awareness value worth the premium, or should budget shift to higher-efficiency channels?",
    color: '#F8B457',
  },
  {
    title: 'Invest in Cart Recovery',
    body: 'All paid channels show 72-74% drop-off at checkout. A Klaviyo cart abandonment flow or on-site incentive could recover revenue from existing traffic at no additional ad cost.',
    color: '#db704f',
  },
];

// ---------------------------------------------------------------------------
// PAGE COMPONENT
// ---------------------------------------------------------------------------
export default function BudgetPage() {
  // Budget scenario sliders: keyed by channelId, value is adjustment percentage (-50 to 100)
  const [adjustments, setAdjustments] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    paidChannels.forEach((ch) => {
      init[ch.channelId] = 0;
    });
    return init;
  });

  // Projected metrics from sliders
  const projections = useMemo(() => {
    return paidChannels.map((ch) => {
      const adj = adjustments[ch.channelId] || 0;
      const adjFraction = adj / 100;
      const diminishingFactor = 0.7;
      const projectedSpend = ch.spend * (1 + adjFraction);
      const projectedNewCustomers = Math.round(
        ch.newCustomers * (1 + adjFraction * diminishingFactor)
      );
      const projectedRevenue = ch.revenue * (1 + adjFraction * diminishingFactor);
      return {
        channelId: ch.channelId,
        channelName: ch.channelName,
        currentSpend: ch.spend,
        projectedSpend,
        currentNewCustomers: ch.newCustomers,
        projectedNewCustomers,
        projectedRevenue,
      };
    });
  }, [adjustments]);

  const totalProjectedSpend = projections.reduce((s, p) => s + p.projectedSpend, 0);
  const totalProjectedNewCustomers = projections.reduce(
    (s, p) => s + p.projectedNewCustomers,
    0
  );
  const totalProjectedRevenue = projections.reduce(
    (s, p) => s + p.projectedRevenue,
    0
  );
  const projectedBlendedROAS =
    totalProjectedSpend > 0 ? totalProjectedRevenue / totalProjectedSpend : 0;

  function handleSliderChange(channelId: string, value: number) {
    setAdjustments((prev) => ({ ...prev, [channelId]: value }));
  }

  function resetSliders() {
    const reset: Record<string, number> = {};
    paidChannels.forEach((ch) => {
      reset[ch.channelId] = 0;
    });
    setAdjustments(reset);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ----------------------------------------------------------------- */}
      {/* Page Header                                                        */}
      {/* ----------------------------------------------------------------- */}
      <header>
        <h1 className="text-3xl font-bold text-[#434C53] tracking-tight">
          Where to Invest More, What to Cut
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Budget optimization and scenario modeling
        </p>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Disclaimer Banner                                                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="rounded-lg p-4 bg-[#F8B457]/15 border border-[#F8B457]/40">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-[#F8B457] mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-[#434C53] leading-relaxed">
            <span className="font-semibold">Important:</span> This tool uses historical data to model
            potential outcomes. All projections are estimates that assume linear scaling with a
            diminishing returns factor. Use as a directional guide, not a guarantee.
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Section 1: Current Spend vs Results                                */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            Current Spend vs. Results
          </h2>
          <Tooltip content="Compares where your paid ad budget goes (left) against where new customers actually come from (right). Mismatches between these two charts indicate potential inefficiency." />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DonutChart
              data={spendDonutData}
              title="Monthly Spend by Channel (Paid Only)"
              centerLabel={fmtCurrency(totalPaidSpend)}
            />
            <DonutChart
              data={customerDonutData}
              title="New Customers by Channel (Paid Only)"
              centerLabel={`${fmtNumber(totalPaidNewCustomers)} new`}
            />
          </div>

          {/* Gap callout */}
          {biggestGap && Math.abs(biggestGap.gap) > 5 && (
            <div className="mt-6 bg-[#C3E3F2]/40 border border-[#C3E3F2] rounded-lg p-4">
              <p className="text-sm text-[#434C53] leading-relaxed">
                <span className="font-semibold">Biggest gap:</span>{' '}
                {biggestGap.gap > 0 ? (
                  <>
                    You are spending {biggestGap.spendShare.toFixed(0)}% of paid budget on{' '}
                    {biggestGap.name}, but {biggestGap.name} drives only{' '}
                    {biggestGap.customerShare.toFixed(0)}% of paid new customers.
                  </>
                ) : (
                  <>
                    {biggestGap.name} delivers {biggestGap.customerShare.toFixed(0)}% of paid new
                    customers but only receives {biggestGap.spendShare.toFixed(0)}% of the paid budget
                    — it may be underinvested.
                  </>
                )}
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
            <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
            If a channel gets a bigger slice of the spend donut than the new customers donut, it is
            relatively expensive for what it delivers. If the opposite is true, the channel is
            punching above its weight.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section 2: Efficiency Table                                        */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            Channel Efficiency
          </h2>
          <Tooltip content="Ranks all channels by how efficiently they acquire new customers. Green = top quartile, amber = middle, red = bottom. Organic channels have $0 spend but still deliver customers." />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-[#434C53]">Channel</th>
                <th className="text-right px-4 py-3 font-medium text-[#434C53]">
                  <span className="inline-flex items-center gap-1">
                    Monthly Spend
                    <Tooltip content="How much is spent on this channel per month in ad spend." />
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-medium text-[#434C53]">
                  <span className="inline-flex items-center gap-1">
                    New Customers
                    <Tooltip content="Number of first-time purchasers this channel brought in during the period." />
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-medium text-[#434C53]">
                  <span className="inline-flex items-center gap-1">
                    Cost / New Customer
                    <Tooltip content="CPA (Cost Per Acquisition): monthly spend divided by new customers. Lower is better. $0 means the channel is organic (free)." />
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-medium text-[#434C53]">
                  <span className="inline-flex items-center gap-1">
                    ROAS
                    <Tooltip content="Return on Ad Spend: total revenue divided by total spend. Higher is better. N/A for organic channels with $0 spend." />
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-medium text-[#434C53]">
                  <span className="inline-flex items-center gap-1">
                    Efficiency Score
                    <Tooltip content="A composite score (0-100) that weighs cost per customer, ROAS, and volume. Higher is better." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {mockEfficiency.map((row) => (
                <tr
                  key={row.channelId}
                  className={`border-b border-gray-50 ${rankColor(row.rank)}`}
                >
                  <td className="px-4 py-3 text-[#434C53] font-medium">
                    {row.channelName}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {row.monthlySpend > 0 ? fmtCurrency(row.monthlySpend) : '$0'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {fmtNumber(row.newCustomers)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {row.costPerNewCustomer > 0
                      ? fmtCurrency(row.costPerNewCustomer)
                      : '$0 (organic)'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {row.roas > 0 ? `${row.roas.toFixed(2)}x` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.rank === 'top'
                          ? 'text-[#639922]'
                          : row.rank === 'mid'
                          ? 'text-amber-700'
                          : 'text-[#E24B4A]'
                      }`}
                    >
                      {row.efficiencyScore}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
          <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
          Green rows are your most efficient channels — they deliver the most value for the least
          cost. Amber rows are solid but have room for improvement. Red rows are the least efficient
          and may benefit from optimization or budget reallocation.
        </p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section 3: Budget Scenario Modeler                                 */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            Budget Scenario Modeler
          </h2>
          <Tooltip content="Use the sliders to model what might happen if you increase or decrease spend on each channel. Projections use a 0.7 diminishing returns factor (a 100% budget increase yields roughly 70% more customers, not 100%)." />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <div className="space-y-6">
            {paidChannels.map((ch) => {
              const adj = adjustments[ch.channelId] || 0;
              const proj = projections.find((p) => p.channelId === ch.channelId);

              return (
                <div key={ch.channelId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-[#434C53]">
                        {ch.channelName}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        Current: {fmtCurrency(ch.spend)}/mo
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-semibold ${
                          adj > 0
                            ? 'text-[#639922]'
                            : adj < 0
                            ? 'text-[#E24B4A]'
                            : 'text-[#434C53]'
                        }`}
                      >
                        {adj > 0 ? '+' : ''}
                        {adj}%
                      </span>
                      {proj && (
                        <span className="ml-2 text-xs text-gray-400">
                          = {fmtCurrency(proj.projectedSpend)}/mo
                          {' '}&#8594;{' '}
                          {fmtNumber(proj.projectedNewCustomers)} projected new customers
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 w-8 text-right">-50%</span>
                    <input
                      type="range"
                      min={-50}
                      max={100}
                      value={adj}
                      onChange={(e) =>
                        handleSliderChange(ch.channelId, parseInt(e.target.value))
                      }
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006373]"
                    />
                    <span className="text-[10px] text-gray-400 w-10">+100%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Projected Spend</p>
                <p className="text-xl font-bold text-[#434C53]">
                  {fmtCurrency(totalProjectedSpend)}
                </p>
                <p className="text-[10px] text-gray-400">
                  {totalProjectedSpend > totalPaidSpend
                    ? `+${fmtCurrency(totalProjectedSpend - totalPaidSpend)} vs current`
                    : totalProjectedSpend < totalPaidSpend
                    ? `-${fmtCurrency(totalPaidSpend - totalProjectedSpend)} vs current`
                    : 'No change'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Projected New Customers</p>
                <p className="text-xl font-bold text-[#434C53]">
                  {fmtNumber(totalProjectedNewCustomers)}
                </p>
                <p className="text-[10px] text-gray-400">
                  {totalProjectedNewCustomers > totalPaidNewCustomers
                    ? `+${fmtNumber(totalProjectedNewCustomers - totalPaidNewCustomers)} vs current`
                    : totalProjectedNewCustomers < totalPaidNewCustomers
                    ? `-${fmtNumber(totalPaidNewCustomers - totalProjectedNewCustomers)} vs current`
                    : 'No change'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Projected Blended ROAS</p>
                <p className="text-xl font-bold text-[#434C53]">
                  {projectedBlendedROAS > 0
                    ? `${projectedBlendedROAS.toFixed(2)}x`
                    : 'N/A'}
                </p>
                <p className="text-[10px] text-gray-400">
                  Current: {(totalPaidRevenue / totalPaidSpend).toFixed(2)}x
                </p>
              </div>
            </div>
          </div>

          {/* Reset button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetSliders}
              className="px-4 py-2 text-sm font-medium text-[#006373] bg-white border border-[#006373]/30 rounded-lg hover:bg-[#006373]/5 transition-colors"
            >
              Reset to Current
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
            <span className="font-semibold text-[#434C53]">How the projections work:</span>{' '}
            Each slider adjusts the monthly spend for that channel by -50% to +100%. Projected new
            customers are calculated as: current customers multiplied by (1 + adjustment multiplied by 0.7). The
            0.7 factor accounts for diminishing returns — doubling your budget rarely doubles your
            results.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section 4: Recommendations                                         */}
      {/* ----------------------------------------------------------------- */}
      <section className="pb-8">
        <h2 className="text-xl font-semibold text-[#434C53] mb-4">
          Questions to Consider
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.title}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: rec.color }}
                />
                <div>
                  <h3 className="text-sm font-semibold text-[#434C53] mb-1">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {rec.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
          <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
          These are strategic questions based on the data above — not prescriptive answers. Each
          one should be evaluated in context with your full business goals, seasonal patterns, and
          market conditions before making budget changes.
        </p>
      </section>
    </div>
  );
}
